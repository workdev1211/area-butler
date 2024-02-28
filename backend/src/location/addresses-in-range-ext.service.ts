import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Language, PlaceType2 } from '@googlemaps/google-maps-services-js';

import { ApiCoordinates } from '@area-butler-types/types';
import { GoogleApiService } from '../client/google/google-api.service';
import { distanceInMeters } from '../shared/functions/shared';
import { HereGeocodeService } from '../client/here/here-geocode.service';
import {
  ApiAddrInRangeApiTypesEnum,
  IApiAddressInRange,
} from '../shared/types/external-api';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { ApiHereLanguageEnum } from '../shared/types/here';

// import { createChunks } from '../../../shared/functions/shared.functions';

interface IFetchedAddresses {
  addresses: IApiAddressInRange[];
  apiRequestsNumber: number;
}

interface IFetchedAddressesInRange {
  coordinates: ApiCoordinates;
  sourceAddress: string;
  returnedAddressesNumber: number;
  returnedAddresses: IApiAddressInRange[];
  apiRequestsNumber: number;
}

// const MAXIMUM_RADIUS = 400;
// const MINIMUM_ADDRESSES_NUMBER = 200;

interface IFetchAddrInRangeData {
  apiType: ApiAddrInRangeApiTypesEnum;
  location: string | ApiCoordinates;
  radius: number; // meters
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];
  language?: Language;
}

@Injectable()
export class AddressesInRangeExtService {
  private readonly logger = new Logger(AddressesInRangeExtService.name);

  constructor(
    private readonly googleApiService: GoogleApiService,
    private readonly hereGeocodeService: HereGeocodeService,
  ) {}

  async fetchAddressesInRange({
    apiType,
    location,
    radius,
    allowedCountries,
    language,
  }: IFetchAddrInRangeData): Promise<IFetchedAddressesInRange> {
    let resultLanguage = language;

    const place = await this.googleApiService.fetchPlace(
      location,
      allowedCountries,
      language,
    );

    if (
      !place ||
      !place.geometry.location ||
      !Array.isArray(place.address_components)
    ) {
      this.logger.debug(
        `!place = ${!place}, !location = ${!place.geometry
          .location}, !addressComponents = ${!Array.isArray(
          place.address_components,
        )}.`,
      );

      throw new HttpException('Place not found!', 400);
    }

    let fetchedAddresses;

    if (!resultLanguage) {
      const country = place.address_components
        .find(({ types }) => types.includes(PlaceType2.country))
        ?.short_name?.toLowerCase();

      resultLanguage =
        Object.values(Language).find(
          (value) => (value as string) === country,
        ) || Language.de;
    }

    switch (apiType) {
      case ApiAddrInRangeApiTypesEnum.HERE: {
        const hereLanguage =
          Object.values(ApiHereLanguageEnum).find(
            (value) => (value as string) === resultLanguage,
          ) || ApiHereLanguageEnum.DE;

        fetchedAddresses = await this.fetchAddressesByHere(
          place.geometry.location,
          radius,
          hereLanguage,
        );

        break;
      }

      case ApiAddrInRangeApiTypesEnum.GOOGLE: {
        fetchedAddresses = await this.fetchAddressesByGoogle(
          place.geometry.location,
          radius,
          resultLanguage,
        );
        break;
      }
    }

    const sortedAddresses = fetchedAddresses.addresses.sort(
      (
        { distance_in_meters: firstDistance },
        { distance_in_meters: secondDistance },
      ) => firstDistance - secondDistance,
    );

    const filteredAddresses = sortedAddresses.reduce(
      (result, currentAddress, i) => {
        if (!currentAddress) {
          return result;
        }

        const isNotDuplicate =
          i ===
          sortedAddresses.findIndex(
            (otherAddress) =>
              currentAddress?.full_address === otherAddress?.full_address,
          );

        // const isAcceptable =
        //   true ||
        //   (currentAddress.distance_in_meters <= MAXIMUM_RADIUS &&
        //     (currentAddress.distance_in_meters <= radius ||
        //       result.length <= MINIMUM_ADDRESSES_NUMBER));

        const isAcceptable = currentAddress.distance_in_meters <= radius;

        if (isNotDuplicate && isAcceptable) {
          result.push(currentAddress);
        }

        return result;
      },
      [],
    );

    return {
      coordinates: place.geometry.location,
      sourceAddress: place.formatted_address,
      returnedAddressesNumber: filteredAddresses.length,
      returnedAddresses: filteredAddresses,
      apiRequestsNumber: fetchedAddresses.apiRequestsNumber,
    };
  }

  private generateCoordinateGrid(
    location: ApiCoordinates,
    radius: number,
    distanceStep: number, // delta in meters between points
  ): ApiCoordinates[] {
    const nMin = -1 * Math.floor(radius / distanceStep);
    const nMax = Math.ceil(radius / distanceStep);
    const locations = [location];

    for (let i = nMin; i < nMax; i += 1) {
      for (let j = nMin; j < nMax; j += 1) {
        const deltaLat = i / 1200;
        const deltaLng = j / 1200;

        const estimatedLocation = {
          lat: location.lat + deltaLat,
          lng: location.lng + deltaLng,
        };

        const distance = distanceInMeters(location, estimatedLocation);

        if ((distance === radius || distance < radius) && distance !== 0) {
          locations.push(estimatedLocation);
        }
      }
    }

    if (!locations.length) {
      throw new HttpException(
        "The current address / radius combination doesn't allow to find any locations!",
        400,
      );
    }

    return locations;
  }

  private async fetchAddressesByGoogle(
    coordinates: ApiCoordinates,
    radius: number,
    language: Language,
  ): Promise<IFetchedAddresses> {
    const coordinateGrid = this.generateCoordinateGrid(coordinates, radius, 20);

    const addresses = await Promise.all(
      coordinateGrid.map(async (coordinates) => {
        const currentPlace = await this.googleApiService.fetchPlace(
          coordinates,
          [],
          language,
        );

        if (
          !currentPlace ||
          !currentPlace.formatted_address ||
          !currentPlace.geometry.location ||
          !Array.isArray(currentPlace.address_components)
        ) {
          return;
        }

        return {
          full_address: currentPlace.formatted_address,
          street_name: currentPlace.address_components.find(({ types }) =>
            types.includes(PlaceType2.route),
          )?.long_name,
          street_number: currentPlace.address_components.find(({ types }) =>
            types.includes(PlaceType2.street_number),
          )?.long_name,
          postal_code: currentPlace.address_components.find(({ types }) =>
            types.includes(PlaceType2.postal_code),
          )?.long_name,
          locality: currentPlace.address_components.find(({ types }) =>
            types.includes(PlaceType2.locality),
          )?.long_name,
          country: currentPlace.address_components.find(({ types }) =>
            types.includes(PlaceType2.country),
          )?.long_name,
          location: currentPlace.geometry.location,
          distance_in_meters: distanceInMeters(
            coordinates,
            currentPlace.geometry.location,
          ),
        };
      }),
    );

    return { addresses, apiRequestsNumber: coordinateGrid.length };
  }

  private async fetchAddressesByHere(
    coordinates: ApiCoordinates,
    radius: number,
    language: ApiHereLanguageEnum,
  ): Promise<IFetchedAddresses> {
    const coordinateGrid = this.generateCoordinateGrid(coordinates, radius, 50);
    const addresses: IApiAddressInRange[] = [];

    // Uncomment in case of HERE API rate limits issue
    for await (const coordinates of coordinateGrid) {
      const places = await this.hereGeocodeService.fetchAddressesInRange(
        coordinates,
        radius,
        language,
      );

      if (!places.length) {
        return;
      }

      places.forEach((currentPlace) => {
        addresses.push({
          full_address: currentPlace.title,
          street_name: currentPlace.address.street,
          street_number: currentPlace.address.houseNumber,
          postal_code: currentPlace.address.postalCode,
          locality: currentPlace.address.city,
          country: currentPlace.address.countryName,
          location: currentPlace.position,
          distance_in_meters: distanceInMeters(
            coordinates,
            currentPlace.position,
          ),
        });
      });
    }

    // Was commented because of the HERE API rate limits issue
    // Chunk approach
    // const chunks = createChunks(coordinateGrid, 15);
    //
    // for await (const chunk of chunks) {
    //   await Promise.all(
    //     chunk.map(async (coordinates) => {
    //       const places = await this.hereGeocodeService.fetchAddressesInRange(
    //         coordinates,
    //         distanceStep,
    //         language,
    //       );
    //
    //       if (!places.length) {
    //         return;
    //       }
    //
    //       places.forEach((currentPlace) => {
    //         addresses.push({
    //           full_address: currentPlace.title,
    //           street_name: currentPlace.address.street,
    //           street_number: currentPlace.address.houseNumber,
    //           postal_code: currentPlace.address.postalCode,
    //           locality: currentPlace.address.city,
    //           country: currentPlace.address.countryName,
    //           location: currentPlace.position,
    //           distance_in_meters: distanceInMeters(
    //             location,
    //             currentPlace.position,
    //           ),
    //         });
    //       });
    //     }),
    //   );
    // }

    // Was commented because of the HERE API rate limits issue
    // Full speed ahead
    // await Promise.all(
    //   coordinateGrid.map(async (coordinates) => {
    //     const places = await this.hereGeocodeService.fetchAddressesInRange(
    //       coordinates,
    //       distanceStep,
    //       language,
    //     );
    //
    //     if (!places.length) {
    //       return;
    //     }
    //
    //     places.forEach((currentPlace) => {
    //       addresses.push({
    //         full_address: currentPlace.title,
    //         street_name: currentPlace.address.street,
    //         street_number: currentPlace.address.houseNumber,
    //         postal_code: currentPlace.address.postalCode,
    //         locality: currentPlace.address.city,
    //         country: currentPlace.address.countryName,
    //         location: currentPlace.position,
    //         distance_in_meters: distanceInMeters(
    //           location,
    //           currentPlace.position,
    //         ),
    //       });
    //     });
    //   }),
    // );

    return { addresses, apiRequestsNumber: coordinateGrid.length };
  }
}

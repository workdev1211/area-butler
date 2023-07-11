import { HttpException, Injectable, Logger } from '@nestjs/common';

import {
  ApiAddressesInRangeApiNameEnum,
  ApiCoordinates,
  IApiAddressInRange,
} from '@area-butler-types/types';
import {
  GoogleGeocodeService,
  IGoogleGeocodeResult,
} from '../client/google/google-geocode.service';
import { distanceInMeters } from '../shared/shared.functions';
import {
  allowedCountries,
  ApiGoogleLanguageEnum,
} from '@area-butler-types/google';
import { ApiHereLanguageEnum } from '@area-butler-types/here';
import { HereGeocodeService } from '../client/here/here-geocode.service';
// import { createChunks } from '../../../shared/functions/shared.functions';

interface IFetchedAddresses {
  addresses: IApiAddressInRange[];
  requestsNumber: number;
}

interface IFetchedAddressesRes {
  sourceAddress: string;
  returnedAddressesNumber: number;
  returnedAddresses: IApiAddressInRange[];
  requestType: ApiAddressesInRangeApiNameEnum;
  requestsNumber: number;
}

const MAXIMUM_RADIUS = 400;
const MINIMUM_ADDRESSES_NUMBER = 200;

@Injectable()
export class ApiAddressesInRangeService {
  private readonly logger = new Logger(ApiAddressesInRangeService.name);

  constructor(
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly hereGeocodeService: HereGeocodeService,
  ) {}

  async fetchAddressesInRange(
    location: string | ApiCoordinates,
    radius = 150, // meters
    language?: string,
    apiName = ApiAddressesInRangeApiNameEnum.HERE,
  ): Promise<IFetchedAddressesRes> {
    let resultingLanguage = language;

    const place = await this.googleGeocodeService.fetchPlace(location);

    const isInAllowedCountry = place?.address_components.some(
      ({ short_name: shortName, types }) =>
        types.includes('country') && allowedCountries.includes(shortName),
    );

    if (
      !place ||
      !place.geometry.location ||
      !Array.isArray(place.address_components) ||
      !isInAllowedCountry
    ) {
      this.logger.debug(
        `!place = ${!place}, !location = ${!place.geometry
          .location}, !addressComponents = ${!Array.isArray(
          place.address_components,
        )}, !isInAllowedCountry = ${!isInAllowedCountry}`,
      );

      throw new HttpException('The location was not found!', 400);
    }

    if (!resultingLanguage) {
      resultingLanguage =
        place.address_components.find(({ types }) => types.includes('country'))
          ?.short_name || ApiGoogleLanguageEnum.DE;
    }

    let fetchedAddresses;

    switch (apiName) {
      case ApiAddressesInRangeApiNameEnum.HERE: {
        resultingLanguage = Object.values(ApiHereLanguageEnum).includes(
          resultingLanguage as ApiHereLanguageEnum,
        )
          ? resultingLanguage
          : ApiHereLanguageEnum.DE;

        fetchedAddresses = await this.fetchAddressesByHere(
          place,
          radius,
          resultingLanguage as ApiHereLanguageEnum,
        );
        break;
      }

      case ApiAddressesInRangeApiNameEnum.GOOGLE: {
        resultingLanguage = Object.values(ApiGoogleLanguageEnum).includes(
          resultingLanguage as ApiGoogleLanguageEnum,
        )
          ? resultingLanguage
          : ApiGoogleLanguageEnum.DE;

        fetchedAddresses = await this.fetchAddressesByGoogle(
          place,
          radius,
          resultingLanguage as ApiGoogleLanguageEnum,
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

        const isAcceptable =
          true ||
          (currentAddress.distance_in_meters <= MAXIMUM_RADIUS &&
            (currentAddress.distance_in_meters <= radius ||
              result.length <= MINIMUM_ADDRESSES_NUMBER));

        if (isNotDuplicate && isAcceptable) {
          result.push(currentAddress);
        }

        return result;
      },
      [],
    );

    return {
      sourceAddress: place.formatted_address,
      returnedAddressesNumber: filteredAddresses.length,
      returnedAddresses: filteredAddresses,
      requestType: apiName,
      requestsNumber: fetchedAddresses.requestsNumber,
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
    { geometry: { location } }: IGoogleGeocodeResult,
    radius: number,
    language: ApiGoogleLanguageEnum,
  ): Promise<IFetchedAddresses> {
    const coordinateGrid = this.generateCoordinateGrid(location, radius, 20);

    const addresses = await Promise.all(
      coordinateGrid.map(async (coordinates) => {
        const currentPlace = await this.googleGeocodeService.fetchPlace(
          coordinates,
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
            types.includes('route'),
          )?.long_name,
          street_number: currentPlace.address_components.find(({ types }) =>
            types.includes('street_number'),
          )?.long_name,
          postal_code: currentPlace.address_components.find(({ types }) =>
            types.includes('postal_code'),
          )?.long_name,
          locality: currentPlace.address_components.find(({ types }) =>
            types.includes('locality'),
          )?.long_name,
          country: currentPlace.address_components.find(({ types }) =>
            types.includes('country'),
          )?.long_name,
          location: currentPlace.geometry.location,
          distance_in_meters: distanceInMeters(
            location,
            currentPlace.geometry.location,
          ),
        };
      }),
    );

    return { addresses, requestsNumber: coordinateGrid.length };
  }

  private async fetchAddressesByHere(
    { geometry: { location } }: IGoogleGeocodeResult,
    radius: number,
    language: ApiHereLanguageEnum,
  ): Promise<IFetchedAddresses> {
    const coordinateGrid = this.generateCoordinateGrid(location, radius, 50);
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
          distance_in_meters: distanceInMeters(location, currentPlace.position),
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

    return { addresses, requestsNumber: coordinateGrid.length };
  }
}

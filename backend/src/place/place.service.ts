import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  GeocodeResult,
  Language,
  PlaceType2,
} from '@googlemaps/google-maps-services-js';

import { ApiCoordinates } from '@area-butler-types/types';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { GoogleApiService } from '../client/google/google-api.service';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

interface IApiFetchPlaceByUser {
  user: UserDocument | TIntegrationUserDocument;
  isNotLimitCountries?: never;
}

interface IApiFetchPlaceWoLimits {
  isNotLimitCountries: true;
  user?: never;
}

export type TApiFetchPlace = (IApiFetchPlaceByUser | IApiFetchPlaceWoLimits) & {
  location: string | ApiCoordinates;
  language?: Language;
};

// Still too related to the Google API service, but much less than before.
@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);

  constructor(private readonly googleApiService: GoogleApiService) {}

  async fetchPlace({
    location,
    isNotLimitCountries,
    user,
    language = Language.de,
  }: TApiFetchPlace): Promise<GeocodeResult> {
    let place;

    try {
      if (
        typeof location === 'object' &&
        'lat' in location &&
        'lng' in location
      ) {
        place = await this.googleApiService.fetchPlaceByCoordinates(
          location,
          language,
        );
      }

      if (typeof location === 'string') {
        place = await this.googleApiService.fetchPlaceByAddress(
          location,
          language,
        );
      }
    } catch (e) {
      this.logger.error(
        `\nMethod: ${this.fetchPlace.name}.\nError message: ${e.response?.data?.error_message}.`,
      );

      throw e;
    }

    if (!place) {
      return;
    }

    if (isNotLimitCountries) {
      return place;
    }

    const allowedCountries = this.getAllowedCountries(user);
    const country = place.address_components.find(({ types }) =>
      types.includes(PlaceType2.country),
    )?.short_name;

    if (!allowedCountries.includes(country)) {
      this.logger.error(
        `\nMethod: ${this.fetchPlace.name}.` +
          `\nMessage: ${`Country ${country} is not allowed!`}` +
          `\nAllowed countries: [${allowedCountries.join(', ')}].`,
      );

      return;
    }

    return place;
  }

  async fetchPlaceOrFail(
    fetchPlaceParams: TApiFetchPlace,
  ): Promise<GeocodeResult> {
    const place = await this.fetchPlace(fetchPlaceParams);

    if (!place) {
      const errorMessage = 'Place not found!';

      this.logger.debug(
        `\nMethod: ${this.fetchPlaceOrFail.name}.` +
          `\nMessage: ${errorMessage}.` +
          `\nLocation: ${location}.`,
      );

      throw new HttpException(errorMessage, 400);
    }

    return place;
  }

  private getAllowedCountries(
    user: UserDocument | TIntegrationUserDocument,
  ): Iso3166_1Alpha2CountriesEnum[] {
    const isIntegrationUser = 'integrationUserId' in user;
    let allowedCountries;

    if (user.parentUser) {
      allowedCountries = isIntegrationUser
        ? user.parentUser.config.allowedCountries
        : user.parentUser.allowedCountries;
    }

    if (!allowedCountries && !user.parentUser) {
      allowedCountries = isIntegrationUser
        ? user.config.allowedCountries
        : user.allowedCountries;
    }

    return allowedCountries || [Iso3166_1Alpha2CountriesEnum.DE];
  }
}

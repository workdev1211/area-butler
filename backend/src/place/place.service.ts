import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  GeocodeResult,
  Language,
  PlaceType2,
} from '@googlemaps/google-maps-services-js';

import { ApiCoordinates } from '@area-butler-types/types';
import { GoogleApiService } from '../client/google/google-api.service';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  notAllowedCountryMsg,
  placeNotFoundMsg,
} from '../../../shared/constants/error';
import { defaultAllowedCountries } from '../../../shared/constants/location';

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
  private static readonly logger = new Logger(PlaceService.name);

  constructor(private readonly googleApiService: GoogleApiService) {}

  async fetchPlaceOrFail({
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
      PlaceService.logger.error(
        `\nMethod: ${this.fetchPlaceOrFail.name}.\nError message: ${e.response?.data?.error_message}.`,
      );

      throw e;
    }

    if (!place) {
      PlaceService.logger.error(
        `\nMethod: ${this.fetchPlaceOrFail.name}.` +
          `\nMessage: ${placeNotFoundMsg}.` +
          `\nLocation: ${location}.`,
      );

      throw new HttpException(placeNotFoundMsg, 400);
    }

    if (isNotLimitCountries) {
      return place;
    }

    if (
      !PlaceService.checkIsCountryAllowed(
        user,
        place,
        this.fetchPlaceOrFail.name,
      )
    ) {
      throw new HttpException(notAllowedCountryMsg, 402);
    }

    return place;
  }

  async fetchPlace(fetchPlaceParams: TApiFetchPlace): Promise<GeocodeResult> {
    return this.fetchPlaceOrFail(fetchPlaceParams).catch(() => undefined);
  }

  static checkIsCountryAllowed(
    user: UserDocument | TIntegrationUserDocument,
    place: GeocodeResult,
    methodName?: string,
  ): boolean {
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

    const resAllowedCountries = allowedCountries || defaultAllowedCountries;

    const country = place.address_components.find(({ types }) =>
      types.includes(PlaceType2.country),
    )?.short_name;

    if (!resAllowedCountries.includes(country)) {
      PlaceService.logger.error(
        `\nMethod: ${methodName || PlaceService.checkIsCountryAllowed.name}.` +
          `\nMessage: ${`Country ${country} is not allowed!`}` +
          `\nAllowed countries: [${resAllowedCountries.join(', ')}].`,
      );

      return false;
    }

    return true;
  }
}

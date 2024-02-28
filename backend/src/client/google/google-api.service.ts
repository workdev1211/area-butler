import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  Client,
  GeocodeResult,
  Language,
  PlaceType2,
} from '@googlemaps/google-maps-services-js';

import { configService } from '../../config/config.service';
import { ApiCoordinates } from '@area-butler-types/types';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';

@Injectable()
export class GoogleApiService {
  private readonly logger = new Logger(GoogleApiService.name);
  private readonly googleServerApiKey = configService.getGoogleServerApiKey();
  private readonly client = new Client();

  private async fetchPlaceByAddress(
    address: string,
    language = Language.de,
  ): Promise<GeocodeResult> {
    const {
      data: { results },
    } = await this.client.geocode({
      params: { address, language, key: this.googleServerApiKey },
    });

    return results[0];
  }

  private async fetchPlaceByCoordinates(
    coordinates: ApiCoordinates,
    language = Language.de,
  ): Promise<GeocodeResult> {
    const {
      data: { results },
    } = await this.client.reverseGeocode({
      params: { language, key: this.googleServerApiKey, latlng: coordinates },
    });

    return results[0];
  }

  // TODO move to a separate place search class in order to be able to connect other place apis
  async fetchPlace(
    location: string | ApiCoordinates,
    allowedCountries = [Iso3166_1Alpha2CountriesEnum.DE], // '[]' - no limitations
    language = Language.de,
  ): Promise<GeocodeResult> {
    let place;

    try {
      if (
        typeof location === 'object' &&
        'lat' in location &&
        'lng' in location
      ) {
        place = await this.fetchPlaceByCoordinates(location, language);
      }

      if (typeof location === 'string') {
        place = await this.fetchPlaceByAddress(location, language);
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

    const country = place.address_components.find(({ types }) =>
      types.includes(PlaceType2.country),
    )?.short_name;

    let isAllowedCountry = false;

    if (Array.isArray(allowedCountries)) {
      isAllowedCountry =
        allowedCountries.length > 0 ? allowedCountries.includes(country) : true;
    }

    if (!isAllowedCountry) {
      this.logger.debug(
        `\nMethod: ${this.fetchPlace.name}.` +
          `\nCountry: ${country}.` +
          `\nAllowed countries: ${Array.isArray(allowedCountries)}.`,
      );

      throw new HttpException(`Country ${country} is not allowed!`, 402);
    }

    return place;
  }

  // TODO move to a separate place search class in order to be able to connect other place apis
  async fetchPlaceOrFail(
    location: string | ApiCoordinates,
    allowedCountries = [Iso3166_1Alpha2CountriesEnum.DE],
    language = Language.de,
  ): Promise<GeocodeResult> {
    const place = await this.fetchPlace(location, allowedCountries, language);

    if (!place) {
      this.logger.debug(
        `\nMethod: ${this.fetchPlaceOrFail.name}.` +
          `\nPlace not found!` +
          `\nLocation is ${location}.` +
          `\nAllowed countries are [${allowedCountries.join(',')}].` +
          `\nLanguage is ${language}.`,
      );

      throw new HttpException('Place not found!', 400);
    }

    return place;
  }
}

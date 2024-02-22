import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  Client,
  GeocodeResult,
  Language,
} from '@googlemaps/google-maps-services-js';

import { configService } from '../../config/config.service';
import { ApiCoordinates } from '@area-butler-types/types';

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

  async fetchPlace(
    location: string | ApiCoordinates,
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
        `\nMethod: ${this.fetchPlace.name}.\n`,
        e.response?.data?.error_message,
      );

      throw e;
    }

    return place;
  }

  async fetchPlaceOrFail(
    location: string | ApiCoordinates,
    language = Language.de,
  ): Promise<GeocodeResult> {
    const place = await this.fetchPlace(location, language);

    if (!place) {
      this.logger.error(
        `Method: ${this.fetchPlaceOrFail.name}.\nPlace not found!\nLocation is ${location}.\nLanguage is ${language}.`,
      );

      throw new HttpException('Place not found!', 400);
    }

    return place;
  }
}

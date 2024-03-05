import { Injectable } from '@nestjs/common';
import {
  Client,
  GeocodeResult,
  Language,
} from '@googlemaps/google-maps-services-js';

import { configService } from '../../config/config.service';
import { ApiCoordinates } from '@area-butler-types/types';

@Injectable()
export class GoogleApiService {
  private readonly googleServerApiKey = configService.getGoogleServerApiKey();
  private readonly client = new Client();

  async fetchPlaceByAddress(
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

  async fetchPlaceByCoordinates(
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
}

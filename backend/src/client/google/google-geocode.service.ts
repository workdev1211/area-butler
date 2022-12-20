import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { configService } from '../../config/config.service';
import { ApiCoordinates } from '@area-butler-types/types';
import { ApiGoogleLanguageEnum } from '../../../../shared/constants/google';

export interface IGoogleGeocodeResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: ApiCoordinates;
    location_type: string;
    viewport: unknown;
  };
  place_id: string;
  plus_code: unknown;
  types: string[];
}

@Injectable()
export class GoogleGeocodeService {
  private readonly googleServerApiKey = configService.getGoogleServerApiKey();
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/geocode';

  constructor(private readonly http: HttpService) {}

  async fetchPlaceByAddress(
    address: string,
    language = ApiGoogleLanguageEnum.DE,
  ): Promise<IGoogleGeocodeResult | undefined> {
    const url = `${this.baseUrl}/json?key=${
      this.googleServerApiKey
    }&address=${encodeURIComponent(address)}&language=${language}`;

    const {
      data: { results },
    } = await firstValueFrom<{
      data: { results: IGoogleGeocodeResult[] };
    }>(
      this.http.get<{ results: IGoogleGeocodeResult[] }>(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    return results[0];
  }

  async fetchPlaceByCoordinates(
    { lat, lng }: ApiCoordinates,
    language = ApiGoogleLanguageEnum.DE,
  ): Promise<IGoogleGeocodeResult | undefined> {
    const url = `${this.baseUrl}/json?key=${this.googleServerApiKey}&latlng=${lat},${lng}&language=${language}`;

    const {
      data: { results },
    } = await firstValueFrom<{
      data: { results: IGoogleGeocodeResult[] };
    }>(
      this.http.get<{ results: IGoogleGeocodeResult[] }>(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    return results[0];
  }
}

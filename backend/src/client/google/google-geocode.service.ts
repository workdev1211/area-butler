import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { configService } from '../../config/config.service';
import { ApiCoordinates } from '@area-butler-types/types';

export interface IGoogleGeocodeResult {
  address_components: unknown[];
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

  async getCoordinatesByAddress(address: string): Promise<ApiCoordinates> {
    const url = `${this.baseUrl}/json?key=${
      this.googleServerApiKey
    }&address=${encodeURIComponent(address)}`;

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

    return results[0]?.geometry?.location;
  }
}

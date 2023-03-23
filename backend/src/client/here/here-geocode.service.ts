import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { configService } from '../../config/config.service';
import { ApiCoordinates } from '@area-butler-types/types';
import { ApiHereLanguageEnum } from '@area-butler-types/here';

export interface IHereReverseGeocodeItem {
  title: string;
  id: string;
  resultType: string;
  houseNumberType: string;
  address: {
    label: string;
    countryCode: string;
    countryName: string;
    stateCode: string;
    state: string;
    countyCode: string;
    county: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    houseNumber: string;
  };
  position: ApiCoordinates;
  access: ApiCoordinates[];
  distance: number;
  mapView: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}

@Injectable()
export class HereGeocodeService {
  private readonly hereApiKey = configService.getHereApiKey();

  constructor(private readonly http: HttpService) {}

  async fetchAddressesInRange(
    { lat, lng }: ApiCoordinates,
    radius: number,
    language = ApiHereLanguageEnum.DE,
  ): Promise<IHereReverseGeocodeItem[]> {
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?in=circle:${lat},${lng};r=1000&lang=${language}&limit=100&apiKey=${this.hereApiKey}`;

    const {
      data: { items },
    } = await firstValueFrom<{
      data: { items };
    }>(
      this.http.get<any>(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    return items;
  }
}

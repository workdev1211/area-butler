import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import {
  IPropstackApiFetchEstatesRes,
  IPropstackRealEstate,
} from '../../shared/propstack.types';

export const REAL_ESTATES_PER_PAGE = 20;

@Injectable()
export class PropstackApiService {
  private readonly apiUrl = 'https://api.propstack.de/v1';

  constructor(private readonly http: HttpService) {}

  async fetchRealEstates(
    apiKey: string,
    pageNumber: number,
  ): Promise<IPropstackApiFetchEstatesRes> {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackApiFetchEstatesRes;
    }>(
      this.http.get<IPropstackApiFetchEstatesRes>(
        `${this.apiUrl}/units?with_meta=1&page=${pageNumber}&per=${REAL_ESTATES_PER_PAGE}`,
        { headers },
      ),
    );

    return data;
  }

  async fetchRealEstateById(
    apiKey: string,
    realEstateId: number,
  ): Promise<IPropstackRealEstate> {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackRealEstate;
    }>(
      this.http.get<IPropstackRealEstate>(
        `${this.apiUrl}/units/${realEstateId}`,
        { headers },
      ),
    );

    return data;
  }
}

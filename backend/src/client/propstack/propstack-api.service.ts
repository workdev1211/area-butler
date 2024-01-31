import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import {
  IPropstackApiFetchEstates,
  IPropstackApiFetchedEstates,
  IPropstackRealEstate,
  IPropstackRealEstateStatus,
} from '../../shared/propstack.types';
import { filterQueryParams } from '../../../../shared/functions/shared.functions';
import { configService } from '../../config/config.service';

interface IPropstackRealEstLink {
  property_id: number;
  title: string;
  url: string;
  is_private?: boolean;
  is_embedable?: boolean;
  on_landing_page?: boolean;
  pinned?: boolean;
}

// This value is recommended by Propstack
export const PROPSTACK_ESTATES_PER_PAGE = 20;

@Injectable()
export class PropstackApiService {
  private readonly apiUrl =
    configService.getSystemEnv() === 'prod'
      ? 'https://api.propstack.de/v1'
      : 'https://api.staging.propstack.de/v1';

  constructor(private readonly http: HttpService) {}

  async fetchRealEstates({
    apiKey,
    pageNumber = 1,
    queryParams = {},
    isTest = false,
  }: IPropstackApiFetchEstates): Promise<IPropstackApiFetchedEstates> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const resultingPerPage = isTest ? 1 : PROPSTACK_ESTATES_PER_PAGE;

    const resultingQueryParams = filterQueryParams(
      new URLSearchParams({
        ...queryParams,
        with_meta: '1',
        expand: '1',
        page: `${pageNumber}`,
        per: `${resultingPerPage}`,
      }),
    ).toString();

    const { data } = await firstValueFrom<{
      data: IPropstackApiFetchedEstates;
    }>(
      this.http.get<IPropstackApiFetchedEstates>(
        `${this.apiUrl}/units?${resultingQueryParams}`,
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
      'X-Api-Key': apiKey,
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

  async updateRealEstateById(
    apiKey: string,
    realEstateId: number,
    updatedParams: Partial<IPropstackRealEstate>,
  ): Promise<IPropstackRealEstate> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackRealEstate;
    }>(
      this.http.put<IPropstackRealEstate>(
        `${this.apiUrl}/units/${realEstateId}`,
        { property: updatedParams },
        { headers },
      ),
    );

    return data;
  }

  async createRealEstLink(
    apiKey: string,
    realEstLinkData: IPropstackRealEstLink,
  ): Promise<IPropstackRealEstate> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackRealEstate;
    }>(
      this.http.post<IPropstackRealEstate>(
        `${this.apiUrl}/links`,
        realEstLinkData,
        { headers },
      ),
    );

    return data;
  }

  async fetchRealEstAvailStatuses(
    apiKey: string,
  ): Promise<IPropstackRealEstateStatus[]> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const {
      data: { data },
    } = await firstValueFrom<{
      data: { data: IPropstackRealEstateStatus[] };
    }>(
      this.http.get<{ data: IPropstackRealEstateStatus[] }>(
        `${this.apiUrl}/property_statuses`,
        {
          headers,
        },
      ),
    );

    return data;
  }
}

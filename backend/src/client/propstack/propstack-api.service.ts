import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import {
  IApiPropstackFetchedProperties,
  IApiPropstackFetchProperties,
  IApiPropstackImage,
  IApiPropstackLink,
  IPropstackBroker, IPropstackCustomFields,
  IPropstackLink,
  IPropstackProperty,
  IPropstackPropertyStatus,
} from '../../shared/types/propstack';
import { filterQueryParams } from '../../../../shared/functions/shared.functions';
import { configService } from '../../config/config.service';
import { IUploadPropertyImageRes } from '@area-butler-types/propstack';

// The value is recommended by Propstack
export const PROPSTACK_PROPERTIES_PER_PAGE = 20;

@Injectable()
export class PropstackApiService {
  private readonly logger = new Logger(PropstackApiService.name);
  private readonly apiUrl =
    configService.getSystemEnv() === 'prod'
      ? 'https://api.propstack.de/v1'
      : 'https://api.staging.propstack.de/v1';

  constructor(private readonly http: HttpService) {}

  async fetchProperties({
    apiKey,
    pageNumber = 1,
    queryParams = {},
    isTest = false,
  }: IApiPropstackFetchProperties): Promise<IApiPropstackFetchedProperties> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const resultingPerPage = isTest ? 1 : PROPSTACK_PROPERTIES_PER_PAGE;

    // keep in mind that property structure with 'expand' option differs from the structure without it
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
      data: IApiPropstackFetchedProperties;
    }>(
      this.http.get<IApiPropstackFetchedProperties>(
        `${this.apiUrl}/units?${resultingQueryParams}`,
        { headers },
      ),
    );

    return data;
  }

  async fetchBrokerById(
    apiKey: string,
    brokerId: number,
  ): Promise<IPropstackBroker> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackBroker;
    }>(
      this.http.get<IPropstackBroker>(`${this.apiUrl}/brokers/${brokerId}`, {
        headers,
      }),
    );

    return data;
  }

  async fetchPropertyById(
    apiKey: string,
    propertyId: number,
  ): Promise<IPropstackProperty> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackProperty;
    }>(
      this.http.get<IPropstackProperty>(`${this.apiUrl}/units/${propertyId}`, {
        headers,
      }),
    );

    return data;
  }

  async updatePropertyById(
    apiKey: string,
    propertyId: number,
    updatedParams: Partial<IPropstackProperty & { partial_custom_fields?: IPropstackCustomFields[]; }>,
  ): Promise<IPropstackProperty> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackProperty;
    }>(
      this.http.put<IPropstackProperty>(
        `${this.apiUrl}/units/${propertyId}`,
        { property: updatedParams },
        { headers },
      ),
    );

    return data;
  }

  async createPropertyLink(
    apiKey: string,
    propertyLinkData: IApiPropstackLink,
  ): Promise<IPropstackLink> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{
      data: IPropstackLink;
    }>(
      this.http.post<IPropstackLink>(`${this.apiUrl}/links`, propertyLinkData, {
        headers,
      }),
    );

    return data;
  }

  async uploadPropertyImage(
    apiKey: string,
    propertyImageData: IApiPropstackImage,
  ): Promise<void> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const { data } = await firstValueFrom<{ data: IUploadPropertyImageRes }>(
      this.http.post<IUploadPropertyImageRes>(
        `${this.apiUrl}/images`,
        propertyImageData,
        {
          headers,
          maxContentLength: 20971520,
          maxBodyLength: 20971520,
        },
      ),
    );

    if (data.ok) {
      return;
    }

    this.logger.debug(this.uploadPropertyImage.name, data);
    throw new HttpException('Propstack image upload failed.', 400);
  }

  async fetchAvailPropStatuses(
    apiKey: string,
  ): Promise<IPropstackPropertyStatus[]> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    };

    const {
      data: { data },
    } = await firstValueFrom<{
      data: { data: IPropstackPropertyStatus[] };
    }>(
      this.http.get<{ data: IPropstackPropertyStatus[] }>(
        `${this.apiUrl}/property_statuses`,
        {
          headers,
        },
      ),
    );

    return data;
  }
}

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import {
  IApiOnOfficeRequest,
  IApiOnOfficeResponse,
} from '@area-butler-types/on-office';

@Injectable()
export class OnOfficeApiService {
  private readonly apiUrl = 'https://api.onoffice.de/api/stable/api.php';

  constructor(private readonly http: HttpService) {}

  async sendRequest(
    requestBody: IApiOnOfficeRequest,
    headers?: { [key: string]: string },
  ): Promise<IApiOnOfficeResponse> {
    let resultingHeaders = {
      'Content-Type': 'application/json',
    };

    if (headers) {
      resultingHeaders = { ...resultingHeaders, ...headers };
    }

    const { data } = await firstValueFrom<{
      data: IApiOnOfficeResponse;
    }>(
      this.http.post<IApiOnOfficeResponse>(this.apiUrl, requestBody, {
        headers: resultingHeaders,
      }),
    );

    return data;
  }
}

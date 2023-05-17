import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';

import {
  IApiOnOfficeRequest,
  IApiOnOfficeResponse,
} from '@area-butler-types/on-office';
import { configService } from '../../config/config.service';

@Injectable()
export class OnOfficeApiService {
  private readonly providerSecret = configService.getOnOfficeProviderSecret();
  private readonly logger = new Logger(OnOfficeApiService.name);
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
        maxBodyLength: 20971520,
      }),
    );

    return data;
  }

  generateSignature(
    data: string,
    secret = this.providerSecret,
    encoding: BufferEncoding = 'hex',
  ): string {
    return createHmac('sha256', secret)
      .update(data)
      .digest()
      .toString(encoding);
  }

  checkResponseIsSuccess(
    methodName: string,
    errorMessage: string,
    request: IApiOnOfficeRequest,
    response: IApiOnOfficeResponse,
  ): void {
    const {
      status: {
        code: responseCode,
        errorcode: responseErrorCode,
        message: responseMessage,
      },
      response: {
        results: [
          {
            status: { errorcode: actionErrorCode, message: actionMessage },
          },
        ],
      },
    } = response;

    const responseIsSuccess =
      responseCode === 200 &&
      responseErrorCode === 0 &&
      responseMessage === 'OK' &&
      actionErrorCode === 0 &&
      actionMessage === 'OK';

    if (!responseIsSuccess) {
      this.logger.error(methodName, request, response);
      throw new HttpException(errorMessage, 400);
    }
  }
}

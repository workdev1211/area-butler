import { HttpException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';

import {
  IApiOnOfficeRequest,
  IApiOnOfficeResponse,
} from '@area-butler-types/on-office';
import { configService } from '../../config/config.service';

export const ON_OFFICE_ESTATES_PER_PAGE = 20;

@Injectable()
export class OnOfficeApiService {
  private static readonly providerSecret =
    configService.getOnOfficeProviderSecret();
  private static readonly logger = new Logger(OnOfficeApiService.name);
  private readonly apiUrl = 'https://api.onoffice.de/api/stable/api.php';

  constructor(private readonly httpService: HttpService) {}

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
      this.httpService.post<IApiOnOfficeResponse>(this.apiUrl, requestBody, {
        headers: resultingHeaders,
        maxBodyLength: 20971520,
      }),
    );

    return data;
  }

  static generateSignature(
    data: string,
    secret = this.providerSecret,
    encoding: BufferEncoding = 'hex',
  ): string {
    return createHmac('sha256', secret)
      .update(data)
      .digest()
      .toString(encoding);
  }

  static checkResponseIsSuccess(
    serviceName: string,
    errorMessage: string,
    request: IApiOnOfficeRequest,
    response: IApiOnOfficeResponse,
  ): void {
    let responseIsSuccess = false;

    try {
      const {
        status: {
          code: responseCode,
          errorcode: responseErrorCode,
          message: responseMessage,
        },
        response: { results },
      } = response;

      responseIsSuccess = results.reduce(
        (
          result,
          { status: { errorcode: actionErrorCode, message: actionMessage } },
        ) => result && actionErrorCode === 0 && actionMessage === 'OK',
        responseCode === 200 &&
          responseErrorCode === 0 &&
          responseMessage === 'OK',
      );
    } catch (e) {
      this.logger.error(this.checkResponseIsSuccess.name, e);
    }

    if (!responseIsSuccess) {
      this.logger.error(`Service: ${serviceName}`, request, response);
      throw new HttpException(errorMessage, 400);
    }
  }
}

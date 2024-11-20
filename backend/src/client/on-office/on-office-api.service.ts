import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
    request: IApiOnOfficeRequest, // should be removed in the future if the current logging is enough
    response: IApiOnOfficeResponse,
  ): void {
    let responseIsSuccess = false;
    const errorMessages: string[] = [];

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
          {
            actionid: respActionId,
            resourceid: resourceId,
            resourcetype: respResourceType,
            status: { errorcode: actionErrorCode, message: actionMessage },
          },
        ) => {
          if (actionErrorCode !== 0) {
            errorMessages.push(
              `Action: ${respActionId.replace(
                /^.+:(\w+)$/,
                '$1',
              )}:${respResourceType}.` +
                `${resourceId ? ` Resource id: ${resourceId}.` : ''}` +
                ` Error code: ${actionErrorCode}.${
                  actionMessage ? ` Message: ${actionMessage}.` : ''
                }`,
            );
          }

          return result && actionErrorCode === 0 && actionMessage === 'OK';
        },
        responseCode === 200 &&
          responseErrorCode === 0 &&
          responseMessage === 'OK',
      );
    } catch (e) {
      this.logger.error(
        this.checkResponseIsSuccess.name,
        `Service: ${serviceName}`,
        e,
      );
    }

    if (!responseIsSuccess) {
      this.logger.error(`Service: ${serviceName}.`);

      errorMessages.forEach((message, i) => {
        this.logger.error(
          `${errorMessages.length > 1 ? `${i + 1}. ` : ''}${message}`,
        );
      });

      throw new BadRequestException(errorMessage);
    }
  }
}

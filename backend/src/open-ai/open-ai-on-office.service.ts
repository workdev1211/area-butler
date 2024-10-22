import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeResourceTypesEnum,
  IApiOnOfficeRealEstateFile,
  IApiOnOfficeRequest,
  IApiOnOfficeResponse,
} from '@area-butler-types/on-office';
import { IApiIntUserOnOfficeParams } from '@area-butler-types/integration-user';
import { OnOfficeApiService } from '../client/on-office/on-office-api.service';
import { configService } from '../config/config.service';

@Injectable()
export class OpenAiOnOfficeService {
  constructor(private readonly onOfficeApiService: OnOfficeApiService) {}

  private readonly onOfficeImageUrl = configService.getOnOfficeImageUrl();

  async fetchEstateImages(
    { parameters }: TIntegrationUserDocument,
    estateId: string,
  ): Promise<Array<IApiOnOfficeRealEstateFile & { url: string }>> {
    const { token, apiKey, customerName, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;

    const actionId = ApiOnOfficeActionIdsEnum.GET;
    const resourceType = ApiOnOfficeResourceTypesEnum.FILE;
    const timestamp = dayjs().unix();

    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: 'estate',
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              estateid: estateId,
              extendedclaim: extendedClaim,
              showispublishedonhomepage: true,
            },
          },
        ],
      },
    };

    const response: IApiOnOfficeResponse<IApiOnOfficeRealEstateFile> =
      await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.fetchEstateImages.name,
      'The estate entity has not been retrieved!',
      request,
      response,
    );

    return response.response.results[0].data.records.map((record) => ({
      ...record.elements,
      url: `${this.onOfficeImageUrl}/${customerName}/${estateId}/${record.elements.filename}`,
    }));
  }
}

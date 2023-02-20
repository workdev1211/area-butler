import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { createHmac } from 'crypto';

import { configService } from '../config/config.service';
import { activateUserPath } from '../shared/on-office.constants';
import { OnOfficeApiService } from '../client/on-office/on-office-api.service';
import {
  IApiOnOfficeRenderData,
  IApiOnOfficeRequest,
  IApiOnOfficeUnlockProvider,
} from '../shared/on-office.types';
import { IntegrationUserService } from '../user/integration-user.service';
import { ApiUserIntegrationTypesEnum } from '@area-butler-types/types';

@Injectable()
export class OnOfficeService {
  private readonly apiUrl = configService.getBaseApiUrl();

  constructor(
    private readonly onOfficeApiService: OnOfficeApiService,
    private readonly integrationUserService: IntegrationUserService,
  ) {}

  async getRenderData({
    userId,
    token,
    parameterCacheId,
    extendedClaim,
  }: {
    userId: string;
    token: string;
    parameterCacheId: string;
    extendedClaim: string;
  }): Promise<IApiOnOfficeRenderData> {
    await this.integrationUserService.upsertUser(
      userId,
      ApiUserIntegrationTypesEnum.ON_OFFICE,
      { extendedClaim },
    );

    const scripts = [{ script: `${this.apiUrl}/on-office/unlockProvider.js` }];

    return {
      providerData: JSON.stringify({
        token,
        parameterCacheId,
        extendedClaim,
        url: `${this.apiUrl}/api/on-office/${activateUserPath}`,
      }),
      scripts,
    };
  }

  async unlockProvider({
    token,
    secret: apiKey,
    parameterCacheId,
    extendedClaim,
  }: IApiOnOfficeUnlockProvider): Promise<any> {
    await this.integrationUserService.findUserAndUpdateParameters(
      {
        integrationType: ApiUserIntegrationTypesEnum.ON_OFFICE,
        'parameters.extendedClaim': extendedClaim,
      },
      { token, apiKey, extendedClaim },
    );

    const actionId = 'urn:onoffice-de-ns:smart:2.5:smartml:action:do';
    const resourceType = 'unlockProvider';
    const timestamp = dayjs().unix();

    const hmac = createHmac('sha256', apiKey)
      .update([timestamp, token, resourceType, actionId].join(''))
      .digest()
      .toString('base64');

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac,
            hmac_version: 2,
            actionid: actionId,
            resourceid: '',
            resourcetype: resourceType,
            parameters: {
              parameterCacheId: parameterCacheId,
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    return this.onOfficeApiService.sendRequest(request);
  }
}

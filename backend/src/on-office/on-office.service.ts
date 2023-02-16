import { Injectable } from '@nestjs/common';

import { configService } from '../config/config.service';
import { activateUserPath } from '../shared/on-office.constants';
import { OnOfficeApiService } from '../client/on-office/on-office-api.service';
import {
  IApiOnOfficeProviderData,
  IApiOnOfficeRenderData,
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
  }: IApiOnOfficeUnlockProvider): Promise<unknown> {
    await this.integrationUserService.updateParameters(
      {
        integrationType: ApiUserIntegrationTypesEnum.ON_OFFICE,
        'parameters.extendedClaim': extendedClaim,
      },
      { token, apiKey, extendedClaim },
    );

    return this.onOfficeApiService.sendRequest<IApiOnOfficeProviderData>({
      actionid: 'urn:onoffice-de-ns:smart:2.5:smartml:action:do',
      resourcetype: 'unlockProvider',
      parameters: {
        parameterCacheId: parameterCacheId,
        extendedclaim: extendedClaim,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';

import { configService } from '../config/config.service';
import { activateUserPath } from '../shared/on-office.constants';
import { OnOfficeApiService } from '../client/on-office/on-office-api.service';
import {
  IApiOnOfficeProviderData,
  IApiOnOfficeRenderData,
  IApiOnOfficeUnlockProvider,
} from '../shared/on-office.types';

@Injectable()
export class OnOfficeService {
  private readonly apiUrl = configService.getBaseApiUrl();

  constructor(private readonly onOfficeApiService: OnOfficeApiService) {}

  getRenderData({
    token,
    parameterCacheId,
    extendedClaim,
  }: {
    token: string;
    parameterCacheId: string;
    extendedClaim: string;
  }): IApiOnOfficeRenderData {
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
    secret,
    parameterCacheId,
    extendedClaim,
  }: IApiOnOfficeUnlockProvider): Promise<unknown> {
    // TODO implement signature generation using token and secret

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

import { OnOfficeApiService } from '../../../client/on-office/on-office-api.service';
import { onOfficeActionMapper } from '../../shared/on-office.constants';
import { OnOfficeActionTypeEnum } from '../../shared/on-office.types';
import { OnOfficeQueryBuilder } from './on-office-query-builder.abstract';

export class OnOfficeCompanyUserMixin {
  getColorAndLogo(this: OnOfficeQueryBuilder): ThisType<OnOfficeQueryBuilder> {
    this.checkUserParams();

    const actionType = OnOfficeActionTypeEnum.GET_COLOR_AND_LOGO;
    const { apiKey, extendedClaim, token } = this.userParams;
    const { actionId, resourceType } = onOfficeActionMapper.get(actionType);

    const signature = OnOfficeApiService.generateSignature(
      [this.timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    this.actions.set(actionType, {
      timestamp: this.timestamp,
      hmac: signature,
      hmac_version: 2,
      actionid: actionId,
      resourceid: '',
      identifier: '',
      resourcetype: resourceType,
      parameters: {
        extendedclaim: extendedClaim,
        data: {
          basicData: {
            characteristicsCi: [
              'color',
              // 'color2',
              'logo',
            ],
          },
        },
      },
    });

    return this;
  }

  getUserData(this: OnOfficeQueryBuilder): ThisType<OnOfficeQueryBuilder> {
    this.checkUserParams();

    const actionType = OnOfficeActionTypeEnum.GET_USER_DATA;
    const { apiKey, extendedClaim, token, userId } = this.userParams;
    const { actionId, resourceType } = onOfficeActionMapper.get(actionType);

    const signature = OnOfficeApiService.generateSignature(
      [this.timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    this.actions.set(actionType, {
      timestamp: this.timestamp,
      hmac: signature,
      hmac_version: 2,
      actionid: actionId,
      resourceid: userId,
      identifier: '',
      resourcetype: resourceType,
      parameters: {
        data: ['Name', 'email'],
        extendedclaim: extendedClaim,
      },
    });

    return this;
  }
}

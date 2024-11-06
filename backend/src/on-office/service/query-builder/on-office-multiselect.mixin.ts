import { OnOfficeApiService } from '../../../client/on-office/on-office-api.service';
import { OnOfficeReqModuleEnum } from '@area-butler-types/on-office';
import { OnOfficeActionTypeEnum } from '../../shared/on-office.types';
import {
  onOfficeActionMapper,
  potentCustomerFieldName,
} from '../../shared/on-office.constants';
import { OnOfficeQueryBuilder } from './on-office-query-builder.abstract';

export class OnOfficeMultiselectMixin {
  getMultiselectConfig(
    this: OnOfficeQueryBuilder,
  ): ThisType<OnOfficeQueryBuilder> {
    const actionType = OnOfficeActionTypeEnum.GET_MULTISELECT_CONFIG;
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
        fields: [potentCustomerFieldName],
        module: OnOfficeReqModuleEnum.ESTATE,
      },
    });

    return this;
  }
}

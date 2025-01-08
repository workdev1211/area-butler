import { OnOfficeApiService } from '../../../client/on-office/on-office-api.service';
import {
  OnOfficeMultiSelModuleEnum,
  OnOfficeReqModuleEnum,
} from '@area-butler-types/on-office';
import { OnOfficeActionTypeEnum } from '../../shared/on-office.types';
import {
  onOfficeActionMapper,
  potentCustomerFieldName,
} from '../../shared/on-office.constants';
import { OnOfficeQueryBuilder } from './on-office-query-builder.abstract';

export interface IOnOfficeMulSelValue {
  fieldKey: string;
  fieldValue: string;
  position?: number;
}

export interface IOnOfficeMulSelReqValues {
  [fieldKey: string]: {
    Ebene: string; // level - '1'
    Feldinhalt: string; // field value
    Position: string; // '1'
    Vater: string; // parent - '0'
    Sprache?: string; // language - enum - 'DEU'
  };
}

export class OnOfficeMultiselectMixin {
  createMultiselectValues(
    this: OnOfficeQueryBuilder,
    fieldValues: IOnOfficeMulSelValue[],
  ): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.CREATE_MULTISELECT_VALUES;
    const { apiKey, extendedClaim, token } = this.user.parameters;
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
      resourceid: potentCustomerFieldName,
      identifier: '',
      resourcetype: resourceType,
      parameters: {
        data: this.convertFieldValues(fieldValues),
        extendedclaim: extendedClaim,
        modul: OnOfficeMultiSelModuleEnum.ESTATE,
      },
    });

    return this;
  }

  getMultiselectValues(
    this: OnOfficeQueryBuilder,
  ): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.GET_MULTISELECT_VALUES;
    const { apiKey, extendedClaim, token } = this.user.parameters;
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

  updateMultiselectValues(
    this: OnOfficeQueryBuilder,
    fieldValues: IOnOfficeMulSelValue[],
  ): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.UPDATE_MULTISELECT_VALUES;
    const { apiKey, extendedClaim, token } = this.user.parameters;
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
      resourceid: potentCustomerFieldName,
      identifier: '',
      resourcetype: resourceType,
      parameters: {
        data: this.convertFieldValues(fieldValues),
        extendedclaim: extendedClaim,
        modul: OnOfficeMultiSelModuleEnum.ESTATE,
      },
    });

    return this;
  }

  deleteMultiselectValues(
    this: OnOfficeQueryBuilder,
    fieldKeys: string[],
  ): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.DELETE_MULTISELECT_VALUES;
    const { apiKey, extendedClaim, token } = this.user.parameters;
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
      resourceid: potentCustomerFieldName,
      identifier: '',
      resourcetype: resourceType,
      parameters: {
        data: fieldKeys,
        extendedclaim: extendedClaim,
        modul: OnOfficeMultiSelModuleEnum.ESTATE,
      },
    });

    return this;
  }

  protected convertFieldValues(
    fieldValues: IOnOfficeMulSelValue[],
  ): IOnOfficeMulSelReqValues {
    return fieldValues.reduce<IOnOfficeMulSelReqValues>(
      (result, { fieldKey, fieldValue, position }, i) => {
        result[fieldKey] = {
          Ebene: '1',
          Feldinhalt: fieldValue,
          Position: `${position || i + 1}`,
          Vater: '0',
        };

        return result;
      },
      {},
    );
  }
}

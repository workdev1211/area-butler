import { UnprocessableEntityException } from '@nestjs/common';

import {
  estateFields,
  onOfficeActionMapper,
} from '../../shared/on-office.constants';
import { OnOfficeApiService } from '../../../client/on-office/on-office-api.service';
import {
  ApiOnOfficeArtTypesEnum,
  OnOfficeOpenAiFieldEnum,
  OnOfficeReqModuleEnum,
} from '@area-butler-types/on-office';
import {
  IApiIntCreateEstateLinkReq,
  TUpdEstTextFieldParams,
} from '@area-butler-types/integration';
import {
  onOfficeLinkFieldMapper,
  onOfficeOpenAiFieldMapper,
} from '../../../../../shared/constants/on-office/on-office-constants';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { OnOfficeQueryBuilder } from './on-office-query-builder.abstract';
import { OnOfficeActionTypeEnum } from '../../shared/on-office.types';
import { TCompanyExportMatch } from '@area-butler-types/company';

export class OnOfficeEstateMixin {
  createLink(
    this: OnOfficeQueryBuilder,
    {
      title,
      url,
      integrationId: estateId,
    }: Omit<IApiIntCreateEstateLinkReq, 'exportType'>,
  ): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.CREATE_LINK;
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
      resourceid: null,
      resourcetype: resourceType,
      identifier: '',
      parameters: {
        title,
        url,
        Art: ApiOnOfficeArtTypesEnum.LINK,
        extendedclaim: extendedClaim,
        module: OnOfficeReqModuleEnum.ESTATE,
        relatedRecordId: estateId,
      },
    });

    return this;
  }

  getAvailStatuses(this: OnOfficeQueryBuilder): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.GET_AVAIL_STATUSES;
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
        fieldList: ['vermarktungsart', 'status2'],
        labels: true,
        language: 'DEU',
        modules: [OnOfficeReqModuleEnum.ESTATE],
      },
    });

    return this;
  }

  getEstateData(
    this: OnOfficeQueryBuilder,
    estateId: string,
  ): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.GET_ESTATE_DATA;
    const { apiKey, extendedClaim, token } = this.user.parameters;
    const { actionId, resourceType } = onOfficeActionMapper.get(actionType);

    const signature = OnOfficeApiService.generateSignature(
      [this.timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const data = [...estateFields, ...Object.values(OnOfficeOpenAiFieldEnum)];
    const exportMatching = this.user.company.config?.exportMatching;

    if (exportMatching) {
      data.push(...Object.values(exportMatching).map(({ fieldId }) => fieldId));
    }

    this.actions.set(actionType, {
      timestamp: this.timestamp,
      hmac: signature,
      hmac_version: 2,
      actionid: actionId,
      resourceid: estateId,
      identifier: '',
      resourcetype: resourceType,
      parameters: {
        data,
        extendedclaim: extendedClaim,
        formatoutput: true,
      },
    });

    return this;
  }

  updateTextFields(
    this: OnOfficeQueryBuilder,
    estateId: string,
    textFieldsParams: TUpdEstTextFieldParams[],
    exportMatching: TCompanyExportMatch,
  ): ThisType<OnOfficeQueryBuilder> {
    this.checkIsUserSet();

    const actionType = OnOfficeActionTypeEnum.UPDATE_TEXT_FIELDS;
    const { apiKey, extendedClaim, token } = this.user.parameters;
    const { actionId, resourceType } = onOfficeActionMapper.get(actionType);

    const signature = OnOfficeApiService.generateSignature(
      [this.timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const defaultMaxTextLength = 2000;

    const processTextFieldParams = ({
      exportType,
      text,
    }: TUpdEstTextFieldParams) => {
      let exportMatchParams = exportMatching && exportMatching[exportType];

      if (exportMatchParams?.fieldId === null) {
        return;
      }

      if (!exportMatchParams) {
        switch (exportType) {
          case AreaButlerExportTypesEnum.LINK_WITH_ADDRESS:
          case AreaButlerExportTypesEnum.LINK_WO_ADDRESS: {
            exportMatchParams = {
              fieldId: onOfficeLinkFieldMapper[exportType],
            };
            break;
          }

          case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
          case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
          case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION:
          case OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION: {
            exportMatchParams = {
              fieldId: onOfficeOpenAiFieldMapper.get(exportType),
              maxTextLength: defaultMaxTextLength,
            };
            break;
          }

          default: {
            throw new UnprocessableEntityException(
              'Could not determine the field id!',
            );
          }
        }
      }

      const processedText =
        exportMatchParams.maxTextLength === 0
          ? text
          : text.slice(
              0,
              exportMatchParams.maxTextLength || defaultMaxTextLength,
            );

      return { [exportMatchParams.fieldId]: processedText };
    };

    const data = textFieldsParams.reduce((result, textFieldParams) => {
      Object.assign(result, processTextFieldParams(textFieldParams));
      return result;
    }, {});

    if (!Object.keys(data).length) {
      return;
    }

    this.actions.set(actionType, {
      timestamp: this.timestamp,
      hmac: signature,
      hmac_version: 2,
      actionid: actionId,
      resourceid: estateId,
      identifier: '',
      resourcetype: resourceType,
      parameters: {
        data,
        extendedclaim: extendedClaim,
      },
    });

    return this;
  }
}

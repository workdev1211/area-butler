import {
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from "../types/integration";
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  IApiIntegrationUserSchema,
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
  TApiIntUserAvailProdContingents,
  TApiIntUserProdContTypes,
} from "../types/integration-user";
import {
  ApiOpenAiRespLimitTypesEnum,
  IApiOpenAiResponseLimit,
  OpenAiQueryTypeEnum,
} from "../types/open-ai";
import { OnOfficeIntActTypesEnum } from "../types/on-office";
import { onOfficeOpenAiCharacterLimit } from "../constants/on-office/constants";

export const getProdContTypeByActType = (
  integrationType: IntegrationTypesEnum,
  actionType: TIntegrationActionTypes
): TApiIntUserProdContTypes | undefined => {
  switch (integrationType) {
    case IntegrationTypesEnum.ON_OFFICE: {
      switch (actionType) {
        case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
        case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION:
        case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
        case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
        case OpenAiQueryTypeEnum.GENERAL_QUESTION: {
          return ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI;
        }

        case OnOfficeIntActTypesEnum.UNLOCK_IFRAME: {
          return ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME;
        }

        case OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE: {
          return ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE;
        }

        case OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT: {
          return ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT;
        }

        default: {
          return;
        }
      }
    }

    default: {
      return;
    }
  }
};

export const getAvailProdContType = (
  integrationType: IntegrationTypesEnum,
  actionType: TIntegrationActionTypes,
  availProdContingents?: TApiIntUserAvailProdContingents
): ApiIntUserOnOfficeProdContTypesEnum | undefined => {
  const prodContType = getProdContTypeByActType(integrationType, actionType);

  if (
    !availProdContingents ||
    !prodContType ||
    prodContType === ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT
  ) {
    return;
  }

  if (availProdContingents[prodContType]) {
    return prodContType;
  }

  const onOfficeProdContTypes = Object.values(
    ApiIntUserOnOfficeProdContTypesEnum
  );

  const requiredProductPosition = onOfficeProdContTypes.indexOf(prodContType);

  return Object.keys(availProdContingents).find(
    (key) =>
      onOfficeProdContTypes.indexOf(
        key as ApiIntUserOnOfficeProdContTypesEnum
      ) > requiredProductPosition
  ) as ApiIntUserOnOfficeProdContTypesEnum;
};

export const getOpenAiRespLimitByInt = (
  integrationType: IntegrationTypesEnum
): IApiOpenAiResponseLimit => {
  switch (integrationType) {
    case IntegrationTypesEnum.ON_OFFICE:
    default: {
      return {
        quantity: onOfficeOpenAiCharacterLimit,
        type: ApiOpenAiRespLimitTypesEnum.CHARACTER,
      };
    }
  }
};

export const checkIsParent = (
  integrationUser: IApiIntegrationUserSchema,
  parentUser: IApiIntegrationUserSchema
): boolean => {
  if (integrationUser.integrationType !== parentUser.integrationType) {
    return false;
  }

  switch (integrationUser.integrationType) {
    case IntegrationTypesEnum.ON_OFFICE: {
      return (
        (integrationUser.parameters as IApiIntUserOnOfficeParams)
          .customerWebId ===
        (parentUser.parameters as IApiIntUserOnOfficeParams).customerWebId
      );
    }

    case IntegrationTypesEnum.PROPSTACK: {
      return (
        (integrationUser.parameters as IApiIntUserPropstackParams).shopId ===
        (parentUser.parameters as IApiIntUserPropstackParams).shopId
      );
    }
  }

  return false;
};

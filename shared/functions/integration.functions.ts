import {
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from "../types/integration";
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  ApiIntUserPropstackProdContTypesEnum,
  IApiIntegrationUserSchema,
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
  TApiIntUserAvailProdContingents,
  TApiIntUserProdContTypes,
} from "../types/integration-user";
import {
  // ApiOpenAiRespLimitTypesEnum,
  // IApiOpenAiResponseLimit,
  OpenAiQueryTypeEnum,
} from "../types/open-ai";
import { OnOfficeIntActTypesEnum } from "../types/on-office";
import { PropstackIntActTypesEnum } from "../types/propstack";
// import { onOfficeOpenAiCharacterLimit } from "../constants/on-office/constants";

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

    case IntegrationTypesEnum.PROPSTACK: {
      switch (actionType) {
        case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
        case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION:
        case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
        case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
        case OpenAiQueryTypeEnum.GENERAL_QUESTION:
        case PropstackIntActTypesEnum.UNLOCK_ALL: {
          return ApiIntUserPropstackProdContTypesEnum.COMPLETE;
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
  availProdContingents: TApiIntUserAvailProdContingents | undefined
): TApiIntUserProdContTypes | undefined => {
  const prodContType = getProdContTypeByActType(integrationType, actionType);
  if (!availProdContingents || !prodContType) {
    return;
  }

  if (availProdContingents[prodContType]) {
    return prodContType;
  }

  let prodContTypes: TApiIntUserProdContTypes[];

  switch (integrationType) {
    case IntegrationTypesEnum.ON_OFFICE: {
      prodContTypes = Object.values(ApiIntUserOnOfficeProdContTypesEnum);
      break;
    }

    case IntegrationTypesEnum.PROPSTACK: {
      prodContTypes = Object.values(ApiIntUserPropstackProdContTypesEnum);
      break;
    }

    default: {
      return;
    }
  }

  // TODO refactor to an array of objects with the tier param instead of the relying to an array position
  const requiredProdPosition = prodContTypes.indexOf(prodContType);

  return Object.keys(availProdContingents).find(
    (key) =>
      prodContTypes.indexOf(key as ApiIntUserOnOfficeProdContTypesEnum) >
      requiredProdPosition
  ) as TApiIntUserProdContTypes;
};

// left just in case
// export const getOpenAiRespLimitByInt = (
//   integrationType: IntegrationTypesEnum
// ): IApiOpenAiResponseLimit => {
//   switch (integrationType) {
//     case IntegrationTypesEnum.ON_OFFICE:
//     default: {
//       return {
//         quantity: onOfficeOpenAiCharacterLimit,
//         type: ApiOpenAiRespLimitTypesEnum.CHARACTER,
//       };
//     }
//   }
// };

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

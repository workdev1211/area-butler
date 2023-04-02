import {
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from "../types/integration";
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  TApiIntUserProdContTypes,
} from "../types/integration-user";
import { OpenAiQueryTypeEnum } from "../types/open-ai";
import { OnOfficeIntActTypesEnum } from "../types/on-office";

export const getProdContTypeByActType = (
  integrationType: IntegrationTypesEnum,
  actionType: TIntegrationActionTypes
): TApiIntUserProdContTypes => {
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

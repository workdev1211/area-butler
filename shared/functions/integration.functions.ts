import {
  IIntUserProdContWithAct,
  IntegrationActionTypeEnum,
  IntegrationTypesEnum,
  onOfficeProdContWithAct,
  propstackProdContWithAct,
} from "../types/integration";
import {
  TApiIntUserAvailProdContingents,
  TApiIntUserProdContType,
} from "../types/integration-user";
// import { onOfficeOpenAiCharacterLimit } from "../constants/on-office/constants";
// import {
//   ApiOpenAiRespLimitTypesEnum,
//   IApiOpenAiResponseLimit,
// } from "../types/open-ai";

export const getAvailProdContType = (
  integrationType: IntegrationTypesEnum,
  actionType: IntegrationActionTypeEnum,
  availProdContingents: TApiIntUserAvailProdContingents | undefined
): TApiIntUserProdContType | undefined => {
  if (!availProdContingents) {
    return;
  }

  let prodContWithAct: IIntUserProdContWithAct[];

  switch (integrationType) {
    case IntegrationTypesEnum.ON_OFFICE: {
      prodContWithAct = onOfficeProdContWithAct;
      break;
    }

    case IntegrationTypesEnum.PROPSTACK: {
      prodContWithAct = propstackProdContWithAct;
      break;
    }

    default: {
      return;
    }
  }

  return prodContWithAct.reduce<IIntUserProdContWithAct | undefined>(
    (result, prodContWithAct) => {
      if (
        prodContWithAct.actionTypes.includes(actionType) &&
        availProdContingents[prodContWithAct.type] &&
        (!result || result.tier > prodContWithAct.tier)
      ) {
        return prodContWithAct;
      }

      return result;
    },
    undefined
  )?.type;
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

export const checkIsSearchNotUnlocked = ({
  iframeEndsAt,
  isOnePageExportActive,
  isStatsFullExportActive,
  openAiRequestQuantity,
}: {
  iframeEndsAt?: Date | string;
  isOnePageExportActive?: boolean;
  isStatsFullExportActive?: boolean;
  openAiRequestQuantity?: number;
}): boolean =>
  (!iframeEndsAt ||
    Date.now() >
      +(typeof iframeEndsAt === "string"
        ? new Date(iframeEndsAt)
        : iframeEndsAt)) &&
  !isOnePageExportActive &&
  !isStatsFullExportActive &&
  typeof openAiRequestQuantity !== "number";

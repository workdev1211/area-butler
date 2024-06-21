import { ISelectTextValue } from "./types";
import {
  AreaButlerExportTypesEnum,
  IIntUserExpMatchParams,
  TApiIntUserProdContType,
} from "./integration-user";
import { OpenAiQueryTypeEnum } from "./open-ai";
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  ApiIntUserPropstackProdContTypesEnum,
} from "./integration-user";
import { OnOfficeProductTypesEnum } from "./on-office";
import { PropstackProductTypeEnum } from "./propstack";

export enum IntegrationTypesEnum {
  ON_OFFICE = "ON_OFFICE",
  PROPSTACK = "PROPSTACK",
}

export interface IApiIntegrationParams {
  integrationType: IntegrationTypesEnum;
  integrationUserId: string;
  integrationId?: string;
}

export interface IApiRealEstateIntegrationParams extends IApiIntegrationParams {
  integrationId: string;
  iframeEndsAt?: Date;
  isOnePageExportActive?: boolean;
  isStatsFullExportActive?: boolean;
  openAiRequestQuantity?: number;
}

// IMPORTANT
// The actions are arranged in a certain order representing their hierarchy.
// Please, check the 'getProdContTypeByActType' method for better understanding.
export enum IntegrationActionTypeEnum {
  UNLOCK_SEARCH = "UNLOCK_SEARCH",
  UNLOCK_OPEN_AI = "UNLOCK_OPEN_AI",
  UNLOCK_IFRAME = "UNLOCK_IFRAME",
  UNLOCK_ONE_PAGE = "UNLOCK_ONE_PAGE",
  UNLOCK_STATS_EXPORT = "UNLOCK_STATS_EXPORT",
}

export interface IIntUserProdContWithAct {
  actionTypes: IntegrationActionTypeEnum[];
  tier: number;
  type: TApiIntUserProdContType;
}

export const onOfficeProdContWithAct: IIntUserProdContWithAct[] = [
  {
    actionTypes: [
      IntegrationActionTypeEnum.UNLOCK_SEARCH,
      IntegrationActionTypeEnum.UNLOCK_OPEN_AI,
    ],
    tier: 2,
    type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
  },
  {
    actionTypes: [
      IntegrationActionTypeEnum.UNLOCK_SEARCH,
      IntegrationActionTypeEnum.UNLOCK_OPEN_AI,
      IntegrationActionTypeEnum.UNLOCK_IFRAME,
    ],
    tier: 3,
    type: ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME,
  },
  {
    actionTypes: [
      IntegrationActionTypeEnum.UNLOCK_SEARCH,
      IntegrationActionTypeEnum.UNLOCK_OPEN_AI,
      IntegrationActionTypeEnum.UNLOCK_IFRAME,
      IntegrationActionTypeEnum.UNLOCK_ONE_PAGE,
    ],
    tier: 4,
    type: ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE,
  },
  {
    actionTypes: [
      IntegrationActionTypeEnum.UNLOCK_SEARCH,
      IntegrationActionTypeEnum.UNLOCK_OPEN_AI,
      IntegrationActionTypeEnum.UNLOCK_IFRAME,
      IntegrationActionTypeEnum.UNLOCK_ONE_PAGE,
      IntegrationActionTypeEnum.UNLOCK_STATS_EXPORT,
    ],
    tier: 5,
    type: ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT,
  },
];

export const propstackProdContWithAct: IIntUserProdContWithAct[] = [
  {
    actionTypes: [
      IntegrationActionTypeEnum.UNLOCK_SEARCH,
      IntegrationActionTypeEnum.UNLOCK_OPEN_AI,
    ],
    tier: 2,
    type: ApiIntUserPropstackProdContTypesEnum.OPEN_AI,
  },
  {
    actionTypes: [
      IntegrationActionTypeEnum.UNLOCK_SEARCH,
      IntegrationActionTypeEnum.UNLOCK_OPEN_AI,
      IntegrationActionTypeEnum.UNLOCK_IFRAME,
      IntegrationActionTypeEnum.UNLOCK_ONE_PAGE,
      IntegrationActionTypeEnum.UNLOCK_STATS_EXPORT,
    ],
    tier: 5,
    type: ApiIntUserPropstackProdContTypesEnum.STATS_EXPORT,
  },
];

export interface IApiUnlockIntProductReq {
  integrationId: string;
  actionType: IntegrationActionTypeEnum;
}

export type TUnlockIntProduct = (
  modalMessage?: string,
  actionType?: IntegrationActionTypeEnum
) => void;

export interface IApiSyncEstatesIntFilterParams {
  estateStatus?: string;
  estateMarketType?: string;
}

export interface IApiRealEstAvailIntStatuses {
  estateStatuses?: ISelectTextValue[];
  estateMarketTypes?: ISelectTextValue[];
}

export interface IApiIntUpdEstTextFieldReq {
  exportType:
    | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
    | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION
    | AreaButlerExportTypesEnum.INLINE_FRAME
    | AreaButlerExportTypesEnum.EMBEDDED_LINKS;
  integrationId: string;
  text: string;
  exportMatchParams?: IIntUserExpMatchParams;
}

export interface IApiIntUploadEstateFileReq {
  exportType:
    | AreaButlerExportTypesEnum.QR_CODE
    | AreaButlerExportTypesEnum.SCREENSHOT
    | AreaButlerExportTypesEnum.ONE_PAGE_PNG;
  base64Content: string;
  fileTitle: string;
  integrationId: string;
  filename?: string;
}

export interface IApiIntCreateEstateLinkReq {
  exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS;
  integrationId: string;
  title: string;
  url: string;
}

export interface IApiIntPublicLinkParams {
  isAddressShown: boolean;
  url: string;
  isLinkEntity?: boolean;
  title?: string;
}

export interface IApiIntSetPropPubLinksReq {
  exportType: AreaButlerExportTypesEnum.EMBEDDED_LINKS;
  integrationId: string;
  publicLinkParams: IApiIntPublicLinkParams[];
}

export type TSendToIntegrationData = {
  integrationId?: string;
} & (
  | Omit<IApiIntUpdEstTextFieldReq, "integrationId">
  | Omit<IApiIntUploadEstateFileReq, "integrationId">
  | Omit<IApiIntCreateEstateLinkReq, "integrationId">
  | Omit<IApiIntSetPropPubLinksReq, "integrationId">
);

export type TIntegrationProductType =
  | keyof typeof OnOfficeProductTypesEnum
  | keyof typeof PropstackProductTypeEnum;

export interface IIntegrationProduct {
  name: string;
  type: TIntegrationProductType;
  price: number;
  image?: string;
  isDisabled?: boolean;
}

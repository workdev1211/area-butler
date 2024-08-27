import {
  ApiIntUserOnOfficeProdContTypesEnum,
  ApiIntUserPropstackProdContTypesEnum,
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
  IIntUserExpMatchParams,
} from "./integration-user";
import { Iso3166_1Alpha2CountriesEnum } from "./location";
import {
  IApiMapboxStyle,
  IApiUserExportFont,
  IApiUserPoiIcons,
  TAreaButlerExportTypes,
} from "./types";
import { IntegrationTypesEnum } from "./integration";
// import { SearchResultSnapshotDocument } from "../../backend/src/location/schema/search-result-snapshot.schema"; // TODO currently buggy

export interface ICompanySubscription {
  expiresAt: Date;
}

interface ICompProdContingent {
  expiresAt: Date;
  total: number;
  used: number;
}

type TCompProdContType =
  | keyof typeof ApiIntUserOnOfficeProdContTypesEnum
  | keyof typeof ApiIntUserPropstackProdContTypesEnum;

export type TCompProdContingents = Partial<
  Record<TCompProdContType, ICompProdContingent[]>
>;

export interface ICompanyConfig {
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[]; // ["DE","ES","CY","KW","OM","QA","SA","AE","IC","HR","AT","CH"]
  color?: string;
  exportFonts?: IApiUserExportFont[];
  exportMatching?: Record<TAreaButlerExportTypes, IIntUserExpMatchParams>;
  extraMapboxStyles?: IApiMapboxStyle[];
  isSpecialLink?: boolean;
  logo?: string;
  mapboxAccessToken?: string;
  mapIcon?: string;
  name?: string;
  poiIcons?: IApiUserPoiIcons;
  // templateSnapshot?: SearchResultSnapshotDocument; // TODO currently buggy
  templateSnapshotId?: string;
}

export interface ICompanySchema {
  config?: ICompanyConfig;
  productContingents?: TCompProdContingents;
  subscription?: ICompanySubscription;
}

export interface ICompanyIntParams {
  [IntegrationTypesEnum.ON_OFFICE]?: Pick<
    IApiIntUserOnOfficeParams,
    "customerWebId"
  >;
  [IntegrationTypesEnum.PROPSTACK]?: Pick<IApiIntUserPropstackParams, "shopId">;
}

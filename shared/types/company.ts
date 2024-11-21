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
  IApiPoiIcons,
  IApiUserExportFont,
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
  exportMatching?: TCompanyExportMatch;
  extraMapboxStyles?: IApiMapboxStyle[];
  isSpecialLink?: boolean;
  logo?: string;
  mapboxAccessToken?: string;
  mapIcon?: string;
  name?: string;
  poiIcons?: IApiPoiIcons;
  // templateSnapshot?: SearchResultSnapshotDocument; // TODO currently buggy
  templateSnapshotId?: string;
  presets?: ICompanyPreset[]
}

export enum PresetTypesEnum {
  SCREENSHOT = "SCREENSHOT",
  DISTRICT_DESC = "DISTRICT_DESC",
  FACEBOOK_POST = "FACEBOOK_POST",
  FORMAL_TO_INFORMAL = "FORMAL_TO_INFORMAL",
  GENERAL_QUESTION = "GENERAL_QUESTION",
  IMPROVE_TEXT = "IMPROVE_TEXT",
  INSTAGRAM_CAPTION = "INSTAGRAM_CAPTION",
  LOCATION_DESCRIPTION = "LOCATION_DESCRIPTION",
  LOCATION_REAL_ESTATE_DESCRIPTION = "LOCATION_REAL_ESTATE_DESCRIPTION",
  MACRO_LOC_DESC = "MACRO_LOC_DESC",
  MICRO_LOC_DESC = "MICRO_LOC_DESC",
  REAL_ESTATE_DESCRIPTION = "REAL_ESTATE_DESCRIPTION",
  EQUIPMENT_DESCRIPTION = "EQUIPMENT_DESCRIPTION",
}

export interface ICompanyPreset {
  type: PresetTypesEnum;
  values: Record<string, unknown>;
}

export type TCompanyExportMatch = Partial<
  Record<TAreaButlerExportTypes, IIntUserExpMatchParams>
>;

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

export type TCompConfBase64Key = keyof Pick<ICompanyConfig, "logo" | "mapIcon">;

export interface IApiCompanyConfig
  extends Omit<ICompanyConfig, "templateSnapshotId"> {
  companyTemplateSnapshotId?: string;
}

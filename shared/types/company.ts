import {
  ApiIntUserOnOfficeProdContTypesEnum,
  ApiIntUserPropstackProdContTypesEnum,
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
  TIntUserExpMatchParams,
} from "./integration-user";
import { Iso3166_1Alpha2CountriesEnum } from "./location";
import {
  IApiMapboxStyle,
  IApiPoiIcons,
  IApiUserExportFont,
  TAreaButlerExportTypes,
} from "./types";
import { IntegrationTypesEnum } from "./integration";
import { OpenAiQueryTypeEnum } from "./open-ai";
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
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[]; // ["DE","ES","CY","KW","OM","QA","SA","AE","IC","HR","AT","CH","GR"]
  color?: string;
  exportFonts?: IApiUserExportFont[];
  exportMatching?: TCompanyExportMatch;
  extraMapboxStyles?: IApiMapboxStyle[];
  logo?: string;
  mapboxAccessToken?: string;
  mapIcon?: string;
  name?: string;
  poiIcons?: IApiPoiIcons;
  // templateSnapshot?: SearchResultSnapshotDocument; // TODO currently buggy
  templateSnapshotId?: string;
  presets?: TCompanyPresets;
}

export enum PresetTypesEnum {
  SCREENSHOT = "SCREENSHOT",
}

export type TPresetTypes = OpenAiQueryTypeEnum | PresetTypesEnum;

export type TCompanyPresets = Partial<
  Record<TPresetTypes, Record<string, unknown>>
>;

export interface IApiCompanyPreset {
  type: TPresetTypes;
  values: Record<string, unknown>;
}

export type TCompanyExportMatch = Partial<
  Record<TAreaButlerExportTypes, TIntUserExpMatchParams>
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

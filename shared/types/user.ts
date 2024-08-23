import {
  IApiMapboxStyle,
  LanguageTypeEnum,
  TApiUserExtConnections,
  TApiUserStudyTours,
  TAreaButlerExportTypes,
} from "./types";
import { IApiKeyParams } from "../../backend/src/shared/types/external-api";
import { Iso3166_1Alpha2CountriesEnum } from "./location";
import { IIntUserExpMatchParams } from "./integration-user";

export interface IUserConfig {
  language: LanguageTypeEnum;
  studyTours: TApiUserStudyTours;
  apiKeyParams?: IApiKeyParams;
  externalConnections?: TApiUserExtConnections;
  fullname?: string;
  templateSnapshotId?: string;

  // OLD
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[]; // ["DE","ES","CY","KW","OM","QA","SA","AE","IC","HR","AT","CH"]
  color?: string;
  exportMatching?: Record<TAreaButlerExportTypes, IIntUserExpMatchParams>;
  extraMapboxStyles?: IApiMapboxStyle[];
  isSpecialLink?: boolean;
  logo?: string;
  mapboxAccessToken?: string;
  mapIcon?: string;
}

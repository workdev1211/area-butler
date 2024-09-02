import {
  LanguageTypeEnum,
  TApiUserExtConnections,
  TApiUserStudyTours,
} from "./types";
import { IApiKeyParams } from "../../backend/src/shared/types/external-api";
import { ICompanyConfig } from "./company";

export interface IUserConfig {
  language: LanguageTypeEnum;
  studyTours: TApiUserStudyTours;

  apiKeyParams?: IApiKeyParams;
  externalConnections?: TApiUserExtConnections;
  fullname?: string;
  templateSnapshotId?: string;
}

export interface IApiUserConfig extends IUserConfig, ICompanyConfig {}

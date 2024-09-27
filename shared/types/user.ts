import {
  LanguageTypeEnum,
  TApiUserExtConnections,
  TApiUserStudyTours,
} from "./types";
import { IApiKeyParams } from "../../backend/src/shared/types/external-api";
import { IApiCompanyConfig } from "./company";
import { TCompanyDocument } from "../../backend/src/company/schema/company.schema";
import { ApiRequestContingent } from "./subscription-plan";
import { SubscriptionDocument } from "../../backend/src/user/schema/subscription.schema";
import { UserDocument } from "../../backend/src/user/schema/user.schema";

export interface IUserSchema {
  companyId: string;
  config: IUserConfig;
  createdAt: Date;
  email: string;
  isAdmin: boolean;
  role: UserRoleEnum;

  company?: TCompanyDocument;
  consentGiven?: Date;
  paypalCustomerId?: string;
  stripeCustomerId?: string;

  // OLD
  requestsExecuted: number;
  requestContingents: ApiRequestContingent[];
  parentId?: string;
  parentUser?: UserDocument;
  subscription?: SubscriptionDocument;
}

export interface IUserConfig {
  language: LanguageTypeEnum;
  studyTours: TApiUserStudyTours;

  apiKeyParams?: IApiKeyParams;
  externalConnections?: TApiUserExtConnections;
  fullname?: string;
  templateSnapshotId?: string;
}

export interface IApiUserConfig extends IUserConfig, IApiCompanyConfig {}

export enum UserRoleEnum {
  admin = "admin",
  user = "user",
}

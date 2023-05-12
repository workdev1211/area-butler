import { ApiCoordinates, ApiMoneyAmount } from "./types";
import { GeoJsonPoint } from "../../backend/src/shared/geo-json.types";
import { IApiIntegrationParams } from "./integration";

export interface IApiRealEstateListingSchema {
  userId?: string;
  name: string;
  address: string;
  externalUrl?: string;
  createdAt?: Date;
  showInSnippet?: boolean;
  costStructure?: ApiRealEstateCost;
  characteristics?: ApiRealEstateCharacteristics;
  location: GeoJsonPoint;
  status?: ApiRealEstateStatusEnum;
  externalId?: string;
  integrationParams?: IApiIntegrationParams;
}

export interface ApiRealEstateListing {
  id: string;
  name: string;
  address: string;
  externalUrl?: string;
  showInSnippet: boolean;
  costStructure?: ApiRealEstateCost;
  characteristics?: ApiRealEstateCharacteristics;
  coordinates: ApiCoordinates;
  status: ApiRealEstateStatusEnum;
  belongsToParent: boolean;
  integrationId?: string; // only for integration users
  openAiRequestQuantity?: number;
  isOnePageExportActive?: boolean;
  externalSource?: ApiRealEstateExtSourcesEnum; // if it was exported from a CRM
  externalId?: string; // if it was exported from a CRM
}

export interface ApiUpsertRealEstateListing {
  name: string;
  address: string;
  location: GeoJsonPoint;
  externalUrl?: string;
  costStructure?: ApiRealEstateCost;
  characteristics?: ApiRealEstateCharacteristics;
  status: ApiRealEstateStatusEnum;
  showInSnippet: boolean;
  externalSource?: ApiRealEstateExtSourcesEnum;
  externalId?: string;
}

// should be present either minPrice or maxPrice, or both
export interface ApiRealEstateCost {
  minPrice?: ApiMoneyAmount;
  price?: ApiMoneyAmount;
  type: ApiRealEstateCostType;
}

export enum ApiRealEstateCostType {
  RENT_MONTHLY_COLD = "RENT_MONTHLY_COLD",
  RENT_MONTHLY_WARM = "RENT_MONTHLY_WARM",
  SELL = "SELL",
}

// TODO make "furnishing" completely optional
export interface ApiRealEstateCharacteristics {
  startingAt?: boolean;
  numberOfRooms?: number;
  realEstateSizeInSquareMeters?: number; // living area
  propertySizeInSquareMeters?: number; // whole area
  energyEfficiency?: ApiEnergyEfficiency;
  furnishing: ApiFurnishing[];
}

export enum ApiFurnishing {
  GARDEN = "GARDEN",
  BALCONY = "BALCONY",
  BASEMENT = "BASEMENT",
  GUEST_REST_ROOMS = "GUEST_REST_ROOMS",
  UNDERFLOOR_HEATING = "UNDERFLOOR_HEATING",
  GARAGE_PARKING_SPACE = "GARAGE_PARKING_SPACE",
  FITTED_KITCHEN = "FITTED_KITCHEN",
  ACCESSIBLE = "ACCESSIBLE",
}

export enum ApiEnergyEfficiency {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
}

export enum ApiRealEstateStatusEnum {
  ALLE = "ALLE",
  IN_PREPARATION = "IN_PREPARATION",
  FOR_RENT = "FOR_RENT", // Miete
  FOR_SALE = "FOR_SALE", // Kauf
  RENTED_SOLD = "RENTED_SOLD",
  NEW_CONSTRUCTION = "NEW_CONSTRUCTION",
}

export interface IApiRealEstateStatus {
  label: string;
  status: ApiRealEstateStatusEnum;
}

export enum ApiExampleFileTypeEnum {
  CSV = "csv",
  XLS = "xls",
}

export enum ApiRealEstateExtSourcesEnum {
  PROPSTACK = "PROPSTACK",
}

export interface IApiPropstackConSettings {
  apiKey: string;
}

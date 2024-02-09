import { ApiCoordinates, ApiMoneyAmount } from "./types";
import { GeoJsonPoint } from "../../backend/src/shared/geo-json.types";
import { IApiRealEstateIntegrationParams } from "./integration";
import { TApiLocIndexProps, TLocationIndexData } from "./location-index";

export interface IApiRealEstateListingSchema {
  address: string;
  location: GeoJsonPoint;
  name: string;

  createdAt?: Date;
  showInSnippet?: boolean;

  integrationParams?: IApiRealEstateIntegrationParams;
  userId?: string;
  externalSource?: ApiRealEstateExtSourcesEnum;
  externalId?: string;
  externalUrl?: string;

  characteristics?: ApiRealEstateCharacteristics;
  costStructure?: ApiRealEstateCost;
  locationIndices?: TApiLocIndexProps;

  status?: string;
  status2?: string;
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
  isFromParent: boolean;
  status?: string;
  status2?: string;
  integrationId?: string; // only for integration users
  openAiRequestQuantity?: number;
  iframeEndsAt?: string;
  isOnePageExportActive?: boolean;
  isStatsFullExportActive?: boolean;
  externalSource?: ApiRealEstateExtSourcesEnum; // if it was exported from a CRM
  externalId?: string; // if it was exported from a CRM
  locationIndices?: TLocationIndexData;
}

// should be present either minPrice or price (maxPrice), or both
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
  realEstateSizeInSquareMeters?: number; // living area - housing area
  propertySizeInSquareMeters?: number; // total area
  energyEfficiency?: ApiEnergyEfficiency;
  furnishing?: ApiFurnishing[];
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
  IN_PREPARATION = "In Vorbereitung",
  FOR_RENT = "Miete",
  FOR_SALE = "Kauf",
  RENTED = "Vermietet",
  SOLD = "Verkauft",
  NEW_CONSTRUCTION = "Neubau",
  ARCHIVED = "Archiviert",
  RESERVED = "Reserviert",
  MARKET_OBSERVATION = "Marktbeobachtung",
}

export enum ApiRealEstateStatus2Enum {
  ACTIVE = "Aktiv",
  INACTIVE = "Inaktiv",
}

export enum ApiExampleFileTypeEnum {
  CSV = "csv",
  XLS = "xls",
}

export enum ApiRealEstateExtSourcesEnum {
  PROPSTACK = "PROPSTACK",
  ON_OFFICE = "ON_OFFICE",
}

export interface IApiPropstackConSettings {
  apiKey: string;
}

export interface IApiOnOfficeConSettings {
  token: string;
  secret: string;
}

export interface IApiRealEstStatusByUser {
  status: string[];
  status2: string[];
}

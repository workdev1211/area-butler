import { ApiCoordinates, ApiMoneyAmount } from "./types";

export interface ApiRealEstateListing {
  id: string;
  name: string;
  address: string;
  externalUrl?: string;
  coordinates?: ApiCoordinates;
  costStructure?: ApiRealEstateCost;
  characteristics?: ApiRealEstateCharacteristics;
  showInSnippet: boolean;
}

export interface ApiUpsertRealEstateListing {
  showInSnippet: boolean;
  name: string;
  address: string;
  externalUrl?: string;
  coordinates?: ApiCoordinates;
  costStructure?: ApiRealEstateCost;
  characteristics?: ApiRealEstateCharacteristics;
}

export interface ApiRealEstateCost {
  price: ApiMoneyAmount;
  startingAt?: boolean;
  type: ApiRealEstateCostType;
}

export enum ApiRealEstateCostType {
  RENT_MONTHLY_COLD = "RENT_MONTHLY_COLD",
  RENT_MONTHLY_WARM = "RENT_MONTHLY_WARM",
  SELL = "SELL"
}

// TODO make "furnishing" completely optional
export interface ApiRealEstateCharacteristics {
  startingAt?: boolean;
  numberOfRooms?: number;
  realEstateSizeInSquareMeters?: number;
  propertySizeInSquareMeters?: number;
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
  ACCESSIBLE = "ACCESSIBLE"
}

export enum ApiEnergyEfficiency {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G"
}

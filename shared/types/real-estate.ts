import { ApiAddress, ApiCoordinates, ApiMoneyAmount } from "./types";

export interface ApiRealEstateListing {
    id: string;
    name: string;
    address: ApiAddress;
    coordinates: ApiCoordinates;
    costStructure?: ApiRealEstateCost;
    characteristics?: ApiRealEstateCharacteristics;
  }

  export interface ApiUpsertRealEstateListing {
    name: string;
    address: ApiAddress;
    coordinates: ApiCoordinates;
    costStructure?: ApiRealEstateCost;
    characteristics?: ApiRealEstateCharacteristics;
  }

  export interface ApiRealEstateCost {
    price: ApiMoneyAmount;
    type: ApiRealEstateCostType;
  }
  
  export enum ApiRealEstateCostType {
    RENT_MONTHLY_COLD = "RENT_MONTHLY_COLD",
    RENT_MONTHLY_WARM = "RENT_MONTHLY_WARM",
    SELL = "SELL",
  }
  
  export interface ApiRealEstateCharacteristics {
    numberOfRooms: number;
    realEstateSizeInSquareMeters: number;
    propertySizeInSquareMeters?: number;
    energyEfficiency: ApiEnergyEfficiency;
    furnishing: ApiFurnishing[];
  }

  export enum ApiFurnishing {
    GARDEN = "GARDEN",
    BALCONY = "BALCONY",
    BASEMENT = "BASEMENT",
    GUEST_REST_ROOMS = "GUEST_REST_ROOMS",
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
import { ApiRealEstateCharacteristics, ApiRealEstateCost } from "./real-estate";
import { ApiCoordinates, OsmName, TransportationParam } from "./types";

export interface ApiUpsertPotentialCustomer {
  name?: string;
  email?: string;
  routingProfiles?: TransportationParam[];
  preferredAmenities?: OsmName[];
  preferredLocations?: ApiPreferredLocation[];
  realEstateCostStructure?: ApiRealEstateCost;
  realEstateCharacteristics?: ApiRealEstateCharacteristics;
}

export interface ApiPotentialCustomer {
  id: string;
  isFromParent: boolean;
  name: string;
  email?: string;
  routingProfiles?: TransportationParam[];
  preferredAmenities?: OsmName[];
  preferredLocations?: ApiPreferredLocation[];
  realEstateCostStructure?: ApiRealEstateCost;
  realEstateCharacteristics?: ApiRealEstateCharacteristics;
}

export interface ApiUpsertQuestionnaireRequest {
  name: string;
  email: string;
  userInCopy: boolean;
}

export interface ApiQuestionnaireRequest {
  id: string;
  name: string;
  email: string;
  userInCopy: boolean;
}

export interface ApiUpsertQuestionnaire {
  token: string;
  customer: ApiUpsertPotentialCustomer;
}

export interface ApiPreferredLocation {
  title: string;
  address: string;
  coordinates?: ApiCoordinates;
}

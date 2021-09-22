import { ApiCoordinates, OsmName, TransportationParam } from "./types";

export interface ApiUpsertPotentialCustomer {
    name: string;
    email: string;
    routingProfiles?: TransportationParam[];
    preferredAmenities?: OsmName[];
    preferredLocations?: ApiPreferredLocation[];
}

export interface ApiPotentialCustomer {
  id: string;
  name: string;
  email: string;
  routingProfiles: TransportationParam[];
  preferredAmenities: OsmName[];
  preferredLocations: ApiPreferredLocation[];
}

export interface ApiPreferredLocation {
  title: string,
  address: string,
  coordinates?: ApiCoordinates
}
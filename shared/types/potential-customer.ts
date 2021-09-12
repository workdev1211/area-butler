import { OsmName, TransportationParam } from "./types";

export interface ApiUpsertPotentialCustomer {
    name: string;
    routingProfiles: TransportationParam[];
    preferredAmenities: OsmName[];    
}

export interface ApiPotentialCustomer {
  id: string;
  name: string;
  routingProfiles: TransportationParam[];
  preferredAmenities: OsmName[];
}

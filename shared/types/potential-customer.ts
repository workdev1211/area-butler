import { OsmName, TransportationParam } from "./types";

export interface ApiUpsertPotentialCustomer {
    name: string;
    email: string;
    routingProfiles?: TransportationParam[];
    preferredAmenities?: OsmName[];    
}

export interface ApiPotentialCustomer {
  id: string;
  name: string;
  email: string;
  routingProfiles: TransportationParam[];
  preferredAmenities: OsmName[];
}

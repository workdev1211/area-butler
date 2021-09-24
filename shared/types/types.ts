export interface ApiConfig {
  auth: {
    clientId: string;
    domain: string;
  };
  googleApiKey: string;
  mapBoxAccessToken: string;
}
export interface ApiUser {
  fullname: string;
  email: string;
}

export interface ApiInsertFeedback {
  description: string;
  type: FeedbackType;
}

export type FeedbackType = 'ERROR' | 'IMPROVEMENT' | 'OTHER';

export interface ApiMoneyAmount {
  amount: number;
  currency: string;
}
export interface ApiSearch {
  coordinates: ApiCoordinates;
  meansOfTransportation: TransportationParam[];
  preferredAmenities: OsmName[];
}

export interface ApiSearchResponse {
  centerOfInterest: ApiOsmLocation;
  routingProfiles: Record<
    MeansOfTransportation,
    { locationsOfInterest: ApiOsmLocation[]; isochrone: ApiIsochrone }
  >;
}

export interface ApiIsochrone {
  features: ApiIsochroneFeature[];
  type: string;
}

export interface ApiIsochroneFeature {
  properties: Record<string, any>;
  geometry: {
    coordinates: any[];
    type: string;
  };
  type: string;
}

export interface ApiOsmLocation {
  entity: ApiOsmEntity;
  coordinates: ApiCoordinates;
  distanceInMeters: number;
  address: ApiAddress;
}

export interface ApiOsmEntity {
  id?: string;
  type: OsmType;
  name: OsmName;
  label: string;
}

export interface ApiAddress {
  street?: string;
  postalCode?: string;
  city?: string;
}

export interface ApiCoordinates {
  lat: number;
  lng: number;
}

export interface TransportationParam {
  type: MeansOfTransportation;
  amount: number;
  unit: UnitsOfTransportation;
}

export enum UnitsOfTransportation {
  MINUTES = "MINUTES",
  METERS = "METERS",
}

export enum MeansOfTransportation {
  WALK = "WALK",
  CAR = "CAR",
  BICYCLE = "BICYCLE",
}

export enum OsmType {
  leisure = "leisure",
  amenity = "amenity",
  shop = "shop",
  public_transport = "public_transport",
  highway = "highway",
}

export enum OsmName {
  playground = "playground",
  school = "school",
  bar = "bar",
  restaurant = "restaurant",
  park = "park",
  chemist = "chemist",
  supermarket = "supermarket",
  doctors = "doctors",
  dentist = "dentist",
  clinic = "clinic",
  kiosk = "kiosk",
  post_office = "post office",
  fuel = "fuel",
  station = "station",
  bus_stop = "bus_stop",
  motorway_link = "motorway_link",
  favorite = "favorite",
  property = "property",
}

import { ApiRequestContingent, ApiSubscriptionPlan } from "./subscription-plan";

export interface ApiConfig {
  auth: {
    clientId: string;
    domain: string;
  };
  googleApiKey: string;
  mapBoxAccessToken: string;
  stripeEnv: 'dev' | 'prod';
}
export interface ApiUser {
  fullname: string;
  email: string;
  subscriptionPlan?: ApiSubscriptionPlan;
  requestsExecuted: number;
  consentGiven?: Date;
  requestContingents: ApiRequestContingent[];
}

export interface ApiUpsertUser {
  fullname: string;
  subscriptionPlan: string; // TODO REMOVE
}

export interface ApiInsertFeedback {
  description: string;
  type: FeedbackType;
}

export type FeedbackType = 'ERROR' | 'IMPROVEMENT' | 'OTHER';

export interface ApiMoneyAmount {
  amount?: number;
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

export enum ApiOsmEntityCategory {
  'LEISURE' = 'Freizeit',
  'SPORT' = 'Sport',
  'TRAFFIC' = 'Verkehr',
  'SUPPLIES' = 'Nahversorgung',
  'HEALTH' = 'Gesundheit',
  'EDUCATION' = 'Bildung'
}

export interface ApiOsmEntity {
  id?: string;
  type: OsmType;
  name: OsmName;
  label: string;
  category: ApiOsmEntityCategory;
  uniqueRadius?: number;
  uniqueTreshold?: number;
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

export interface ApiGeometry {
  type: "Polygon" | "MultiPolygon" | "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "GeometryCollection" | "Feature" | "FeatureCollection";
  coordinates: any[];
}

export interface ApiGeojsonFeature {
  type: "Polygon" | "MultiPolygon" | "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "GeometryCollection" | "Feature" | "FeatureCollection";
  properties: object;
  geometry: ApiGeometry
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
  kindergarten = "kindergarten",
  school = "school",
  university = "university",
  bar = "bar",
  restaurant = "restaurant",
  park = "park",
  theatre = "theatre",
  chemist = "chemist",
  supermarket = "supermarket",
  doctors = "doctors",
  dentist = "dentist",
  clinic = "clinic",
  hospital = "hospital",
  kiosk = "kiosk",
  post_office = "post office",
  fuel = "fuel",
  station = "station",
  bus_stop = "bus_stop",
  motorway_link = "motorway_link",
  sports_centre = "sports_centre",
  sports_hall = "sports_hall",
  swimming_pool = "swimming_pool",
  fitness_centre = "fitness_centre",
  favorite = "favorite",
  property = "property",
}

import { ApiPreferredLocation } from "./potential-customer";
import { ApiRequestContingent, ApiUserSubscription } from "./subscription-plan";

export interface RollbarConfig {
  accessToken: string;
  environment: string;
  code_version: string;
}

export interface ApiConfig {
  auth: {
    clientId: string;
    domain: string;
  };
  googleApiKey: string;
  mapBoxAccessToken: string;
  stripeEnv: 'dev' | 'prod';
  rollbarConfig: RollbarConfig;
}
export interface ApiUser {
  fullname: string;
  email: string;
  subscriptionPlan?: ApiUserSubscription;
  requestsExecuted: number;
  consentGiven?: Date;
  requestContingents: ApiRequestContingent[];
  showTour: ApiShowTour;
  logo?: string;
  color?: string;
}

export interface ApiUpsertUser {
  fullname: string;
}

export interface ApiUserSettings {
  logo?: string;
  color?: string;
}

export interface ApiUserRequests {
  requests: ApiSearch[];
}

export type ApiTour = 'search' | 'result' | 'realEstates' | 'customers' | 'profile';

export interface ApiShowTour {
  search: boolean;
  result: boolean;
  realEstates: boolean;
  customers: boolean;
  profile: boolean
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
  searchTitle?: string;
  withIsochrone?: boolean;
  coordinates: ApiCoordinates;
  preferredLocations?: ApiPreferredLocation[];
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

export type ApiGeojsonType = "Polygon" | "MultiPolygon" | "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "GeometryCollection" | "Feature" | "FeatureCollection";

export interface ApiGeometry {
  type: ApiGeojsonType;
  coordinates: any[];
}

export interface ApiGeojsonFeature {
  type: ApiGeojsonType;
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
  KILOMETERS = "KILOMETERS",
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
  post_office = "post_office",
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


export interface ApiSearchResultSnapshot {
  placesLocation: any;
  location: ApiCoordinates;
  transportationParams: TransportationParam[];
  localityParams: ApiOsmEntity[];
  searchResponse: ApiSearchResponse;
}

export interface ApiSearchResultSnapshotConfig {
  showLocation: boolean;
  mapBoxMapId: string;
}

export interface ApiSearchResultSnapshotResponse {
  mapboxToken: string;
  token: string;
  config?: ApiSearchResultSnapshotConfig;
  snapshot: ApiSearchResultSnapshot;
  createdAt: Date;
}
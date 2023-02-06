import { ApiPreferredLocation } from "./potential-customer";
import { EntityRoute, EntityTransitRoute } from "./routing";
import { ApiRequestContingent, ApiUserSubscription } from "./subscription-plan";
import { ApiRealEstateListing, ApiRealEstateStatusEnum } from "./real-estate";
import { ILimitIncreaseMetadata } from "./billing";

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
  stripeEnv: "dev" | "prod";
  rollbarConfig: RollbarConfig;
  paypalClientId: string;
}

export interface MapBoxStyle {
  key: string;
  label: string;
}

export interface IApiUserExportFont {
  fontFamily: string;
  fontFaces: string[];
}

export interface ApiUser {
  fullname: string;
  email: string;
  subscription?: ApiUserSubscription;
  requestsExecuted: number;
  consentGiven?: Date;
  requestContingents: ApiRequestContingent[];
  showTour: ApiShowTour;
  logo?: string;
  mapIcon?: string;
  color?: string;
  additionalMapBoxStyles: MapBoxStyle[];
  isChild: boolean;
  parentSettings?: IApiUserParentSettings;
  poiIcons?: IApiUserPoiIcon[];
  exportFonts?: IApiUserExportFont[];
}

export interface IApiUserParentSettings {
  logo?: string;
  mapIcon?: string;
  color?: string;
}

export interface ApiUpsertUser {
  fullname: string;
}

export interface ApiUserSettings {
  logo?: string;
  mapIcon?: string;
  color?: string;
}

export interface ApiUserRequests {
  requests: ApiSearch[];
}

export type ApiTour =
  | "search"
  | "result"
  | "realEstates"
  | "customers"
  | "profile"
  | "editor";

export interface ApiShowTour {
  search: boolean;
  result: boolean;
  realEstates: boolean;
  customers: boolean;
  profile: boolean;
  editor: boolean;
}

export interface ApiInsertFeedback {
  description: string;
  type: FeedbackType;
}

export type FeedbackType = "ERROR" | "IMPROVEMENT" | "OTHER";

export interface ApiMoneyAmount {
  amount?: number;
  currency: string;
}

export interface ApiSearch {
  id?: string;
  searchTitle?: string;
  withIsochrone?: boolean;
  coordinates: ApiCoordinates;
  preferredLocations?: ApiPreferredLocation[];
  meansOfTransportation: TransportationParam[];
  preferredAmenities: OsmName[];
  endsAt?: Date;
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
  TRAFFIC = "Verkehr",
  SUPPLIES = "Nahversorgung",
  EDUCATION = "Bildung",
  LEISURE = "Freizeit",
  SPORT = "Sport",
  HEALTH = "Gesundheit",
  INFRASTRUCTURE = "Infrastruktur",
  TOURISM = "Tourismus",
}

export interface ApiOsmEntity {
  id?: string;
  type: OsmType;
  name: OsmName;
  // TODO change to the enum
  label: string;
  title?: string;
  category: ApiOsmEntityCategory;
  uniqueRadius?: number;
  uniqueThreshold?: number;
  access?: string;
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

export type ApiGeojsonType =
  | "Polygon"
  | "MultiPolygon"
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "GeometryCollection"
  | "Feature"
  | "FeatureCollection";

export interface ApiGeometry {
  type: ApiGeojsonType;
  coordinates: any[];
}

export interface ApiGeojsonFeature {
  type: ApiGeojsonType;
  properties: object;
  geometry: ApiGeometry;
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
  tourism = "tourism",
  parking = "parking",
  "generator:method" = "generator:method",
  power = "power",
}

export enum OsmName {
  bar = "bar",
  bus_stop = "bus_stop",
  chemist = "chemist",
  clinic = "clinic",
  dentist = "dentist",
  doctors = "doctors",
  favorite = "favorite",
  fitness_centre = "fitness_centre",
  fuel = "fuel",
  hospital = "hospital",
  kindergarten = "kindergarten",
  kiosk = "kiosk",
  motorway_link = "motorway_link",
  park = "park",
  playground = "playground",
  post_office = "post_office",
  property = "property",
  restaurant = "restaurant",
  school = "school",
  sports_centre = "sports_centre",
  sports_hall = "sports_hall",
  station = "station",
  supermarket = "supermarket",
  swimming_pool = "swimming_pool",
  theatre = "theatre",
  university = "university",
  hotel = "hotel",
  pharmacy = "pharmacy",
  attraction = "attraction",
  "multi-storey" = "multi-storey",
  underground = "underground",
  surface = "surface",
  museum = "museum",
  charging_station = "charging_station",
  wind_turbine = "wind_turbine",
  tower = "tower",
  pole = "pole",
  pub = "pub",
}

export interface ApiUpdateSearchResultSnapshot {
  snapshot: ApiSearchResultSnapshot;
  config: ApiSearchResultSnapshotConfig;
}

export interface ApiSearchResultSnapshot {
  placesLocation: any;
  location: ApiCoordinates;
  transportationParams: TransportationParam[];
  localityParams: ApiOsmEntity[];
  preferredLocations: ApiPreferredLocation[];
  searchResponse: ApiSearchResponse;
  routes: EntityRoute[];
  transitRoutes: EntityTransitRoute[];
  realEstateListing?: ApiRealEstateListing;
  realEstateListings: ApiRealEstateListing[];
}

export interface IApiCreateRouteSnapshotQuery {
  searchData: ApiSearch;
  searchResponse: ApiSearchResponse;
  placesLocation: IApiPlacesLocation;
  config?: ApiSearchResultSnapshotConfig;
}

export interface IApiCreateSnapshotFromTemplateQuery {
  coordinates?: ApiCoordinates;
  address?: string;
  snapshotId: string;
}

export type ApiSearchResultSnapshotConfigTheme = "DEFAULT" | "KF";

export interface ApiSnippetEntityVisibility {
  id: string;
  osmName?: OsmName;
  excluded?: boolean;
}

export interface ApiSearchResultSnapshotConfig {
  showLocation: boolean;
  groupItems: boolean;
  showAddress?: boolean;
  mapBoxMapId?: string;
  theme?: ApiSearchResultSnapshotConfigTheme;
  defaultActiveMeans?: MeansOfTransportation[];
  defaultActiveGroups?: string[];
  entityVisibility?: ApiSnippetEntityVisibility[];
  primaryColor?: string;
  mapIcon?: string;
  fixedRealEstates?: boolean;
  showStreetViewLink?: boolean;
  hideIsochrones?: boolean;
  zoomLevel?: number;
  realEstateStatus?: ApiRealEstateStatusEnum;
  showDetailsInOnePage?: boolean;
}

export interface ApiSearchResultSnapshotResponse {
  id: string;
  mapboxToken: string;
  token: string;
  config?: ApiSearchResultSnapshotConfig;
  snapshot: ApiSearchResultSnapshot;
  description?: string;
  createdAt: Date;
  lastAccess?: Date;
  visitAmount?: number;
  endsAt?: Date;
  updatedAt?: Date;
  isTrial?: boolean;
  userPoiIcons?: IApiUserPoiIcon[];
}

export interface IApiPlacesLocation {
  label: string;
  value: IApiPlacesLocationValue;
}

export interface IApiPlacesLocationValue {
  place_id: string;
}

export interface IApiMongoParams {
  [key: string]: number;
}

export interface IApiCreatePaypalOrderQuery {
  priceId: string;
}

export interface IApiApprovePaypalSubscriptionQuery {
  subscriptionId: string;
}

export interface IApiCapturePaypalPaymentQuery {
  orderId: string;
  metadata?: ILimitIncreaseMetadata;
}

export enum CsvFileFormatEnum {
  AREA_BUTLER = "AREA_BUTLER",
  ON_OFFICE = "ON_OFFICE",
}

export interface IApiUserPoiIcon {
  name: OsmName;
  file: string;
}

export interface IApiUserAssets {
  poiIcons: IApiUserPoiIcon[];
}

export enum ApiDataProvisionEnum {
  ADDRESS_DATA = "addressData",
  ZIP_LEVEL_DATA = "zipLevelData",
}

export enum DataProvisionEnum {
  ADDRESS_DATA = "addressData",
  ZIP_LEVEL_DATA = "zipLevelData",
  AVERAGE_DATA = "averageData",
}

export type TApiDataProvision = Record<
  ApiDataProvisionEnum,
  ApiGeojsonFeature[]
>;

// TODO describe it later
export interface IApiUserUsageStatistics {
  addressesInRange: any;
}

export interface IApiAddressInRange {
  full_address: string;
  street_name: string;
  street_number: string;
  postal_code: string;
  locality: string;
  country: string;
  location: ApiCoordinates;
  distance_in_meters: number;
}

export interface IApiAddressesInRangeResponse {
  address_count: number;
  addresses: IApiAddressInRange[];
}

export enum ApiAddressesInRangeApiNameEnum {
  HERE = "here",
  GOOGLE = "google",
}

export enum IApiAddressesInRangeRequestStatusEnum {
  SUCCESS = "success",
  ERROR = "error",
}

export interface IApiAddressesInRangeRequestStatus {
  status: IApiAddressesInRangeRequestStatusEnum;
  queryParams: string;
  message?: string;
}

export type TPlaceholderSelectOptionKey = "placeholder";

export interface ISelectTextValue {
  text: string;
  value: string;
}

import { ApiPreferredLocation } from "./potential-customer";
import { EntityRoute, EntityTransitRoute } from "./routing";
import { ApiRequestContingent, ApiUserSubscription } from "./subscription-plan";
import {
  ApiRealEstateExtSourcesEnum,
  ApiRealEstateListing,
  IApiOnOfficeConSettings,
  IApiPropstackConSettings,
} from "./real-estate";
import { ILimitIncreaseMetadata } from "./billing";
import {
  paymentEnvironments,
  systemEnvironments,
} from "../constants/constants";
import { IntegrationTypesEnum } from "./integration";
import { Iso3166_1Alpha2CountriesEnum } from "./location";

export interface RollbarConfig {
  accessToken: string;
  environment: string;
  code_version: string;
}

export interface ApiConfig {
  auth?: {
    clientId: string;
    domain: string;
  };
  googleApiKey: string;
  mapBoxAccessToken: string;
  systemEnv: TSystemEnvironment;
  stripeEnv: TPaymentEnvironment;
  rollbarConfig?: RollbarConfig;
  paypalClientId?: string;
  integrationType?: IntegrationTypesEnum;
  sentry: IApiSentryConfig;
}

export interface IApiSentryConfig {
  dsn: string;
  environment: string;
}

export interface IApiMapboxStyle {
  key: string;
  label: string;
}

export interface IApiUserExportFont {
  fontFamily: string;
  fontFaces: string[];
}

export enum LanguageTypeEnum {
  en = 'en',
  de = 'de'
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
  extraMapboxStyles: IApiMapboxStyle[];
  isChild: boolean;
  poiIcons?: IApiUserPoiIcons;
  exportFonts?: IApiUserExportFont[];
  apiConnections?: TApiUserApiConnections;
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];
  templateSnapshotId?: string;
  language: LanguageTypeEnum;
  accessToken?: string; // only on the frontend and MyVivenda specific for the moment
}

export type TApiUserApiConnectSettings = Partial<
  IApiPropstackConSettings & IApiOnOfficeConSettings
>;

export interface IApiUserApiConnectSettingsReq
  extends TApiUserApiConnectSettings {
  connectType: ApiRealEstateExtSourcesEnum;
}

export type TApiUserApiConnections = Partial<
  Record<ApiRealEstateExtSourcesEnum, TApiUserApiConnectSettings>
>;

export interface ApiUpsertUser {
  fullname: string;
}

export interface ApiUserSettings {
  logo?: string;
  mapIcon?: string;
  color?: string;
  templateSnapshotId?: string;
}

export interface ApiUserRequests {
  requests: ApiSearch[];
}

export enum ApiTourNamesEnum {
  SEARCH = "search",
  RESULT = "result", // is not used currently
  REAL_ESTATES = "realEstates",
  CUSTOMERS = "customers",
  PROFILE = "profile",
  EDITOR = "editor",
  INT_MAP = "intMap",
  INT_SEARCH = "intSearch",
}

export type ApiShowTour = Record<ApiTourNamesEnum, boolean>;

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
  integrationId?: string;
}

export interface ApiSearchResponse {
  centerOfInterest: ApiOsmLocation; // center of location search
  routingProfiles: Record<
    MeansOfTransportation,
    { locationsOfInterest: ApiOsmLocation[]; isochrone: ApiIsochrone }
  >; // POIs
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
  address: ApiAddress;
  coordinates: ApiCoordinates;
  distanceInMeters: number;
  entity: ApiOsmEntity;
}

export enum ApiOsmEntityCategory {
  TRAFFIC = "traffic",
  SUPPLIES = "supplies",
  EDUCATION = "education",
  LEISURE = "leisure",
  SPORT = "sport",
  HEALTH = "health",
  INFRASTRUCTURE = "infrastructure",
  TOURISM = "tourism",
}

export interface ApiOsmEntity {
  id?: string;
  type: OsmType;
  name: OsmName;
  // TODO change to an enum
  label: string;
  title?: string;
  category: ApiOsmEntityCategory;
  uniqueRadius?: number;
  uniqueThreshold?: number;
  replacementQuery?: string; // Used in a hack which prevents the addition the third Osm parameter
  additionalQuery?: string;
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
  config?: ApiSearchResultSnapshotConfig;
  customPois?: ApiOsmLocation[];
  description?: string;
  snapshot?: ApiSearchResultSnapshot;
}

/*
  The coordinates of a map location:
  1. 'location' - could be redundant
  2. 'searchResponse.centerOfInterest.coordinates' - a map center in Map.tsx component

  The address of a map location:
  1. 'placesLocation.label' - a map address in Map.tsx component
  2. 'searchResponse.centerOfInterest.address' - could be redundant / should be checked if it's used anywhere
*/
export interface ApiSearchResultSnapshot {
  localityParams: ApiOsmEntity[]; // selected POI types
  location: ApiCoordinates; // coordinates
  placesLocation: any | IApiPlacesLocation; // Google Places id or an address
  searchResponse: ApiSearchResponse; // POIs
  transportationParams: TransportationParam[]; // selected transportation params ('WALK', 'BICYCLE', 'CAR')

  preferredLocations?: ApiPreferredLocation[]; // important places
  realEstate?: ApiRealEstateListing;
  routes?: EntityRoute[]; // routes to important places by foot, bicycle or car
  transitRoutes?: EntityTransitRoute[]; // routes to important places by city transport
}

export interface ApiCreateSnapshotReq {
  snapshot: ApiSearchResultSnapshot;
  integrationId?: string;
  realEstateId?: string;
}

export interface IApiCreateSnapshotFromTemplate {
  coordinates?: ApiCoordinates;
  address?: string;
  snapshotId: string;
}

export type ApiSearchResultSnapshotConfigTheme = "DEFAULT" | "KF";

export interface ApiSnippetEntityVisibility {
  id: string;
  excluded?: boolean;
}

export enum PoiFilterTypesEnum {
  NONE = "NONE",
  BY_DISTANCE = "BY_DISTANCE",
  BY_AMOUNT = "BY_AMOUNT",
}

export interface IApiSnapshotPoiFilter {
  type: PoiFilterTypesEnum;
  value?: number;
}

export interface IApiSnapshotIconSizes {
  mapIconSize?: number;
  poiIconSize?: number;
}

export interface IApiSnapshotConfigRealEstSettings {
  isCharacteristicsHidden?: boolean;
  isCostStructureHidden?: boolean;
  isTypeShown?: boolean;
}

export interface ApiSearchResultSnapshotConfig {
  defaultActiveGroups?: string[]; // MapTab Points-of-Interest active categories --> osmEntityTypes.label
  defaultActiveMeans?: MeansOfTransportation[];
  entityVisibility?: ApiSnippetEntityVisibility[];
  groupItems?: boolean;
  hiddenGroups?: string[]; // EditorTab Points-of-Interest active categories --> osmEntityTypes.label

  hideIsochrones?: boolean;
  hideMeanToggles?: boolean; // for reference map // 'MeansToggle' component used to turn on and off the isochrones
  hideMapMenu?: boolean; // for reference map
  hidePoiIcons?: boolean; // for reference map

  isDetailsShown?: boolean; // extended to other types of export
  isFilterMenuAvail?: boolean; // move to 'realEstateSettings'
  isMapMenuCollapsed?: boolean;
  iconSizes?: IApiSnapshotIconSizes;

  mapBoxMapId?: string;
  mapIcon?: string;
  poiFilter?: IApiSnapshotPoiFilter;
  primaryColor?: string;

  realEstateSettings?: IApiSnapshotConfigRealEstSettings;
  realEstateStatus?: string; // move to 'realEstateSettings'
  realEstateStatus2?: string; // move to 'realEstateSettings'

  showAddress?: boolean;
  showLocation?: boolean;
  showStreetViewLink?: boolean;
  theme?: ApiSearchResultSnapshotConfigTheme;
  zoomLevel?: number;
}

export interface IIframeTokens {
  addressToken: string;
  unaddressToken: string;
  token?: string;
}

export interface ApiSearchResultSnapshotResponse extends IIframeTokens {
  id: string;
  createdAt: Date;
  mapboxAccessToken: string; // seems to exist only for the iFrames, could be removed in the future
  snapshot: ApiSearchResultSnapshot;

  config?: ApiSearchResultSnapshotConfig;
  description?: string;
  endsAt?: Date;
  externalId?: string;
  iframeEndsAt?: Date;
  integrationId?: string;
  isTrial?: boolean;
  lastAccess?: Date;
  updatedAt?: Date;
  visitAmount?: number;
}

export interface IApiPlacesLocation {
  label: string;
  value: IApiPlacesLocationValue;
}

export interface IApiPlacesLocationValue {
  place_id: string;
}

export interface IApiCreatePaypalOrder {
  priceId: string;
}

export interface IApiApprovePaypalSubscription {
  subscriptionId: string;
}

export interface IApiCapturePaypalPayment {
  orderId: string;
  metadata?: ILimitIncreaseMetadata;
}

export enum CsvFileFormatEnum {
  ON_OFFICE = "ON_OFFICE",
}

export interface IApiUserPoiIcon {
  name: OsmName;
  file: string;
}

export interface IApiUserPoiIcons {
  mapPoiIcons?: IApiUserPoiIcon[];
  menuPoiIcons?: IApiUserPoiIcon[];
}

export interface IApiUserAssets {
  poiIcons: IApiUserPoiIcons;
}

export enum ApiDataProvisionEnum {
  ADDRESS_DATA = "addressData",
  ZIP_LEVEL_DATA = "zipLevelData",
  AVERAGE_DATA = "averageData",
}

export type TApiDataProvision = Partial<
  Record<ApiDataProvisionEnum, ApiGeojsonFeature[]>
>;

export type TPlaceholderSelectOptionKey = "placeholder";

export interface ISelectTextValue {
  text: string;
  value: string;
}

export type TPaymentEnvironment = typeof paymentEnvironments[number];
export type TSystemEnvironment = typeof systemEnvironments[number];

export enum ResultStatusEnum {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export enum MapDisplayModesEnum {
  EMBEDDED = "EMBEDDED",
  EDITOR = "EDITOR",
}

export interface IApiFetchedEmbeddedData {
  snapshotRes: ApiSearchResultSnapshotResponse;
  realEstates?: ApiRealEstateListing[];
  userPoiIcons?: IApiUserPoiIcons;
}

export enum FeatureTypeEnum {
  SEARCH = "SEARCH",
  OPEN_AI = "OPEN_AI",
  IFRAME = "IFRAME",
  ONE_PAGE = "ONE_PAGE",
  OTHER_EXPORT = "OTHER_EXPORT",
  STATS_DATA = "STATS_DATA",
}

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
  additionalMapBoxStyles: IApiMapboxStyle[];
  isChild: boolean;
  parentSettings?: IApiUserParentSettings;
  poiIcons?: IApiUserPoiIcons;
  exportFonts?: IApiUserExportFont[];
  apiConnections?: TApiUserApiConnections;
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];
  templateSnapshotId?: string;
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
  templateSnapshotId?: string;
}

export interface ApiUserRequests {
  requests: ApiSearch[];
}

export enum ApiTourNamesEnum {
  "SEARCH" = "search",
  "RESULT" = "result", // is not used currently
  "REAL_ESTATES" = "realEstates",
  "CUSTOMERS" = "customers",
  "PROFILE" = "profile",
  "EDITOR" = "editor",
  "INT_MAP" = "intMap",
  "INT_SEARCH" = "intSearch",
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
  snapshot?: ApiSearchResultSnapshot;
  config?: ApiSearchResultSnapshotConfig;
  description?: string;
}

export interface ApiSearchResultSnapshot {
  placesLocation: any | IApiPlacesLocation;
  location: ApiCoordinates;
  transportationParams: TransportationParam[];
  localityParams: ApiOsmEntity[];
  preferredLocations: ApiPreferredLocation[];
  searchResponse: ApiSearchResponse;
  routes: EntityRoute[];
  transitRoutes: EntityTransitRoute[];
  realEstateListing?: ApiRealEstateListing;
  realEstateListings: ApiRealEstateListing[];
  integrationId?: string;
  token?: string;
}

export interface IApiCreateRouteSnapshot {
  searchData: ApiSearch;
  searchResponse: ApiSearchResponse;
  placesLocation: IApiPlacesLocation;
  config?: ApiSearchResultSnapshotConfig;
}

export interface IApiCreateSnapshotFromTemplate {
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
  showLocation?: boolean;
  groupItems?: boolean;
  showAddress?: boolean;
  showStreetViewLink?: boolean;
  isDetailsShown?: boolean; // extended to other types of export
  hideIsochrones?: boolean;
  hideMeanToggles?: boolean; // for reference map // 'MeansToggle' component used to turn on and off the isochrones
  hideMapMenu?: boolean; // for reference map
  hidePoiIcons?: boolean; // for reference map
  mapBoxMapId?: string;
  theme?: ApiSearchResultSnapshotConfigTheme;
  mapIcon?: string;
  primaryColor?: string;
  zoomLevel?: number;
  defaultActiveGroups?: string[];
  defaultActiveMeans?: MeansOfTransportation[];
  entityVisibility?: ApiSnippetEntityVisibility[];
  fixedRealEstates?: boolean;
  realEstateStatus?: string;
  realEstateStatus2?: string;
  poiFilter?: IApiSnapshotPoiFilter;
  iconSizes?: IApiSnapshotIconSizes;
  isMapMenuCollapsed?: boolean;
  isFilterMenuAvail?: boolean;
  realEstateSettings?: IApiSnapshotConfigRealEstSettings;
}

export interface ApiSearchResultSnapshotResponse {
  id: string;
  mapboxAccessToken: string;
  token: string;
  config?: ApiSearchResultSnapshotConfig;
  snapshot: ApiSearchResultSnapshot;
  description?: string;
  createdAt: Date;
  lastAccess?: Date;
  visitAmount?: number;
  endsAt?: Date;
  iframeEndsAt?: Date;
  updatedAt?: Date;
  isTrial?: boolean;
  userPoiIcons?: IApiUserPoiIcons;
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

export enum CsvFileFormatsEnum {
  AREA_BUTLER = "AREA_BUTLER",
  ON_OFFICE = "ON_OFFICE",
  PADERBORN = "PADERBORN", // temporary for OnOffice object data format
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

export enum ApiRequestStatusesEnum {
  SUCCESS = "success",
  ERROR = "error",
}

export type TPlaceholderSelectOptionKey = "placeholder";

export interface ISelectTextValue {
  text: string;
  value: string;
}

export type TPaymentEnvironment = typeof paymentEnvironments[number];
export type TSystemEnvironment = typeof systemEnvironments[number];

export enum RequestStatusTypesEnum {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export enum MapDisplayModesEnum {
  // TODO remove in the future because of the 'isIntegration' property of 'Map' component
  EMBED_INTEGRATION = "EMBED_INTEGRATION", // left only because of the default map icon
  EMBED = "EMBED",
  EDITOR = "EDITOR",
}

import { IApiIntUserLoginRes } from "./integration-user";

export enum OnOfficeProductTypesEnum {
  OPEN_AI = "OPEN_AI",
  OPEN_AI_10 = "OPEN_AI_10",
  STATS_EXPORT = "STATS_EXPORT",
  STATS_EXPORT_10 = "STATS_EXPORT_10",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export interface IApiOnOfficeUnlockProviderReq {
  token: string;
  secret: string;
  parameterCacheId: string;
  extendedClaim: string;
}

export interface IApiOnOfficeActivationReq {
  apiClaim: string;
  apiToken: string;
  customerWebId: string;
  parameterCacheId: string;
  userId: string;
}

export interface IApiOnOfficeActivationRes {
  providerData: string;
  scripts: Array<{ script: string }>;
}

export interface IApiOnOfficeRequest {
  token: string;
  request: { actions: IApiOnOfficeRequestAction[] };
}

export enum ApiOnOfficeActionIdsEnum {
  READ = "urn:onoffice-de-ns:smart:2.5:smartml:action:read",
  CREATE = "urn:onoffice-de-ns:smart:2.5:smartml:action:create",
  MODIFY = "urn:onoffice-de-ns:smart:2.5:smartml:action:modify",
  GET = "urn:onoffice-de-ns:smart:2.5:smartml:action:get",
  DO = "urn:onoffice-de-ns:smart:2.5:smartml:action:do",
  DELETE = "urn:onoffice-de-ns:smart:2.5:smartml:action:delete",
}

export enum ApiOnOfficeResourceTypesEnum {
  UNLOCK_PROVIDER = "unlockProvider",
  ESTATE = "estate",
  FIELDS = "fields", // field description - get all info about entity fields ("address", "estate", etc)
  BASIC_SETTINGS = "basicsettings", // logo and color
  UPLOAD_FILE = "uploadfile",
  USER = "user",
  FILE = "file",
  MULTISELECT_KEY = "multiselectkey",
  MULTISELECT_CONFIGURATION = "multiselectconfiguration",
}

export interface IApiOnOfficeRequestAction {
  timestamp?: number;
  hmac: string;
  hmac_version: 2;
  actionid: ApiOnOfficeActionIdsEnum;
  resourceid: string;
  identifier: string;
  resourcetype: ApiOnOfficeResourceTypesEnum;
  parameters?: IApiOnOfficeReqActParams;
}

export interface IApiOnOfficeReqActParams {
  parameterCacheId?: string;
  extendedclaim?: string;
  isRegularCustomer?: number;
  data?: unknown;
  labels?: boolean;
  language?: string; // enum
  modules?: string[]; // enum[]
  listlimit?: number; // 20 by default
  listoffset?: number;
  formatoutput?: boolean; // returns text values instead of enums
  filter?: TApiOnOfficeReqParamFilter;
  fieldList?: string[]; // enum[] IApiOnOfficeRealEstate
  module?: OnOfficeReqModuleEnum;
  modul?: OnOfficeMultiSelModuleEnum;
  fields?: string[];
  // file upload start
  freetext?: string; // file description
  tmpUploadId?: string;
  file?: string; // filename
  title?: string; // file title
  Art?: ApiOnOfficeArtTypesEnum;
  documentAttribute?: string; // enum
  setDefaultPublicationRights?: boolean;
  url?: string; // only for links
  relatedRecordId?: string; // real estate id
  estateid?: string; // real estate id
  showispublishedonhomepage?: boolean;
  // file upload end
}

type TApiOnOfficeReqParamFilter = Record<
  string,
  Array<{ op: string; val: unknown }>
>;

export enum ApiOnOfficeArtTypesEnum {
  FOTO = "Foto",
  GRUNDRISS = "Grundriss",
  LAGEPLAN = "Lageplan",
  TITELBILD = "Titelbild",
  LOGO = "LOGO",
  EXPOSE = "Expose",
  AUSHANG = "Aushang",
  MIETAUFSTELLUNG = "Mietaufstellung",
  DOKUMENT = "Dokument",
  // TODO ask Michael how to use FOTO_GROSS instead of FOTO
  FOTO_GROSS = "Foto_gross",
  LINK = "Link",
  PANORAMA = "Panorama",
  BANNER = "Banner",
  STADTPLAN = "Stadtplan",
  "FILM-LINK" = "Film-Link",
  "QR-CODE" = "QR-Code",
  ENERGIEAUSWEIS = "Energieausweis",
  EPASS_SKALA = "Epass_Skala",
  "OGULO-LINK" = "Ogulo-Link",
  "OBJEKT-LINK" = "Objekt-Link",
  ANZEIGEN = "Anzeigen",
  FINANZIERUNGSBEISPIEL = "Finanzierungsbeispiel",
}

export enum ApiOnOfficeFileTypesEnum {
  photo = "Foto",
  cover = "Titelbild",
  sitePlan = "Lageplan",
  qrCode = "QR-Code",
  floorPlan = "Grundriss",
  energyPassScale = "Epass_Skala",
}

// TODO make it the right way - without anys
export interface IApiOnOfficeResponse<T = any> {
  status: {
    code: number; // enum?
    errorcode: number; // enum?
    message: string; // enum?
  };
  response: {
    results: IApiOnOfficeResponseResult<T>[];
  };
}

interface IApiOnOfficeResponseResult<T> {
  actionid: ApiOnOfficeActionIdsEnum;
  resourceid: string;
  resourcetype: ApiOnOfficeResourceTypesEnum;
  cacheable?: boolean;
  identifier: string;
  status: {
    errorcode: number; // enum?
    message: string; // enum?
  };
  data: {
    meta?: {
      cntabsolute?: number;
    };
    records: IApiOnOfficeResponseResultRecord<T>[];
  };
}

interface IApiOnOfficeResponseResultRecord<T> {
  id: string;
  type: string;
  elements: T;
}

// TODO refactor in regard that some onOffice parameters have different labels for export csvs
export interface IApiOnOfficeRealEstate {
  Id: string; // the label is "Datensatznr"
  // status2: ApiOnOfficeEstateStatusesEnum; // the old definition
  status2: string; // the label is "Status"
  objekttitel: string; // estate title
  objekttyp: string; // estate type
  strasse: string; // street name
  hausnummer: string; // building no
  plz: string; // zip code
  ort: string; // location - city, etc
  land: string; // country
  breitengrad: string; // latitude
  laengengrad: string; // longitude
  anzahl_zimmer: string; // number of rooms
  wohnflaeche: string; // nutzflaeche - realEstateSizeInSquareMeters
  grundstuecksflaeche: string; // gesamtflaeche - propertySizeInSquareMeters // the label is "Grundstücksgröße"
  energyClass: string; // the label is "Energieeffizienzklasse"
  kaufpreis: string; // selling price
  waehrung: string; // currency
  kaltmiete: string; // cold rent
  // nettokaltmiete: string; // net cold rent
  warmmiete: string; // warm rent - the most common
  balkon: string; // is a balcony present - 0 or 1 - boolean
  anzahl_balkone: string; // number of balconies
  unterkellert: ApiOnOfficeEstateBasementEnum; // basement
  vermarktungsart: string; // ApiOnOfficeEstateMarketTypesEnum // marketing type - sell, rent, etc
  TargetAudience: string[];
  /*
  // external id in onOffice, in our app we use "Id" / "Datensatznr" field
  objektnr_extern: string; // the label is "ImmoNr"
   */
  // location descriptions
  lage: string; // LOCATION_DESCRIPTION
  sonstige_angaben: string; // LOCATION_REAL_ESTATE_DESCRIPTION
  objektbeschreibung: string; // REAL_ESTATE_DESCRIPTION,
  ausstatt_beschr: string; // EQUIPMENT_DESCRIPTION
}

export interface IApiOnOfficeRealEstateFile {
  type: ApiOnOfficeFileTypesEnum;
  position: number;
  name: string;
  originalName: string;
  filename: string;
  title: string;
  fileSize: number;
}

export enum ApiOnOfficeEstateMarketTypesEnum {
  KAUF = "Kauf",
  MIETE = "Miete",
  PACHT = "Pacht",
  ERBPACHT = "Erbpacht",
}

export enum ApiOnOfficeEstateStatusesEnum {
  INAKTIV = "Inaktiv",
  AKTIV = "Aktiv",
  ARCHIVIERT = "Archiviert",
}

export enum ApiOnOfficeEstateBasementEnum {
  JA = "Ja",
  NEIN = "Nein",
  TEIL = "Teil", // the label is "Teilweise"
  TEILWEISE = "Teilweise", // the label for 'TEIL' option
}

export interface IApiOnOfficeLoginQueryParams {
  apiClaim: string; // extendedClaim
  customerName: string;
  customerWebId: string;
  estateId: string;
  parameterCacheId: string;
  signature: string;
  timestamp: string;
  userId: string;

  groupId?: string;
  imageIds?: string;
  language?: string; // actually an enum - 'DEU'
}

export interface IApiOnOfficeLoginReq {
  url: string; // for passing to the backend - NestJs gets incorrect protocol from request object
  onOfficeQueryParams: IApiOnOfficeLoginQueryParams;
}

export interface IApiOnOfficeCreateOrderReq {
  integrationId: string;
  products: IApiOnOfficeCreateOrderProduct[];
}

export interface IApiOnOfficeConfirmOrderQueryParams {
  message?: string;
  signature: string;
  status: ApiOnOfficeTransactionStatusesEnum;
  timestamp: string;
  errorCodes?: string;
  transactionid?: string;
  referenceid?: string;
  accessToken: string;
  integrationId: string;
  products: string;
}

export type TOnOfficeLoginQueryParams =
  | IApiOnOfficeLoginQueryParams
  | IApiOnOfficeConfirmOrderQueryParams;

export interface IApiOnOfficeConfirmOrderReq {
  url: string;
  onOfficeQueryParams: IApiOnOfficeConfirmOrderQueryParams;
}

export interface IApiOnOfficeConfirmOrderErrorRes {
  message: string;
}

export type TApiOnOfficeConfirmOrderRes =
  | IApiIntUserLoginRes
  | IApiOnOfficeConfirmOrderErrorRes;

export interface IApiOnOfficeCreateOrderProduct {
  transactionDbId?: string;
  type: keyof typeof OnOfficeProductTypesEnum;
  quantity: number;
}

export interface IApiOnOfficeFetchLatestSnapshotReq {
  integrationId: string;
}

export interface IApiOnOfficeProduct {
  name: string;
  price: string;
  quantity: string;
  circleofusers: "customer"; // enum
}

export interface IApiOnOfficeOrderData {
  callbackurl: string;
  parametercacheid: string;
  products: IApiOnOfficeProduct[];
  totalprice: string;
  timestamp: number;
  signature: string;
}

export interface IApiOnOfficeCreateOrderRes {
  onOfficeOrderData: IApiOnOfficeOrderData;
}

export enum ApiOnOfficeTransactionStatusesEnum {
  SUCCESS = "success",
  INPROCESS = "inprocess", // inprocess is SEPA specific status
  ERROR = "error",
}

export enum OnOfficeLoginActionTypesEnum {
  PERFORM_LOGIN = "PERFORM_LOGIN",
  CONFIRM_ORDER = "CONFIRM_ORDER",
}

export interface IApiOnOfficeSyncEstatesFilterParams {
  status2?: string;
  vermarktungsart?: string;
}

export enum OnOfficeOpenAiFieldEnum {
  LOCATION = "lage",
  OTHER_INFO = "sonstige_angaben",
  PROP_DESCRIPTION = "objektbeschreibung",
  EQUIPMENT_DESCRIPTION = "ausstatt_beschr",
}

export enum OnOfficeReqModuleEnum {
  ESTATE = "estate",
  ADDRESS = "address",
  CALENDAR = "calendar",
  TASK = "task",
  AGENTS_LOG = "agentsLog",
  PROJECT = "project",
  FACTURE_ARTICLE_ADMINISTRATION = "fakturaArticleAdministration",
  FACTURE_BOOKINGS = "fakturaBookings",
}

export enum OnOfficeMultiSelModuleEnum {
  ESTATE = "objekte",
  ADDRESS = "adressen",
}

// obtained via the 'GET' request from Propstack
export interface IPropstackRealEstate {
  id: number;
  name: string;
  title?: string;
  street?: string;
  house_number?: string;
  district?: string;
  region?: string;
  zip_code?: string;
  city?: string;
  country?: string;
  address: string;
  short_address: string;
  lat: number;
  lng: number;
  number_of_rooms?: number;
  price?: number;
  living_space?: number;
  property_space_value?: number;
  status: IPropstackRealEstateStatus;
  furnishings?: IPropstackRealEstFurnishings;
  custom_fields?: IPropstackRealEstCustFields;
  location_note?: string;
  description_note?: string;
  other_note?: string;
  // should be added in the future by Propstack team
  // shop_id (unneeded here) is an account id
  department_id?: number; // team id
  broker_id?: number; // user id
}

export interface IPropstackProcessedRealEstate extends IPropstackRealEstate {
  areaButlerStatus?: string;
  areaButlerStatus2?: string;
}

export interface IPropstackRealEstateStatus {
  id: number;
  name: PropstackRealEstStatusesEnum | string;
  color?: string;
}

export interface IPropstackRealEstCustFields {
  objekt_webseiten_url: string;
}

// obtained from a Propstack webhook
export interface IPropstackWebhookRealEstate {
  id: number;
  name: string;
  address: string;
  short_address: string;
  lat: number;
  lng: number;
  property_status: IPropstackRealEstateStatus;
  custom_fields: IPropstackWebhkRealEstCustFields;
  department_id?: number;
}

export interface IPropstackWebhkRealEstCustFields {
  objekt_webseiten_url: IPropstackWebhkRealEstParamValue;
}

export interface IPropstackWebhkRealEstParamValue {
  value: string;
  pretty_value?: string;
}

export enum PropstackRealEstStatusesEnum {
  AKQUISE = 'Akquise',
  IN_VORBEREITUNG = 'In Vorbereitung',
  IN_VERMARKTUNG = 'In Vermarktung',
  RESERVIERT = 'Reserviert',
  VERKAUFT = 'Verkauft',
  INAKTIV = 'Inaktiv',
}

export interface IPropstackRealEstFurnishings {
  cellar: boolean;
  balcony: boolean;
  garden: boolean;
  kitchen_complete: boolean;
  ramp: boolean;
}

export interface IPropstackApiFetchEstates {
  apiKey: string;
  pageNumber?: number;
  queryParams?: IPropstackApiFetchEstsQueryParams;
  isTest?: boolean;
}

export interface IPropstackApiFetchEstsQueryParams {
  order?: string;
  sort_by?: string;
  status?: string; // ID of the status in which the object must be. Multiple statuses are passed separated by commas
  group?: string; // number
  q?: string;
  country?: string;
  project_id?: string; // number
  marketing_type?: string;
  rs_type?: string;
  expand?: string; // number
  archived?: string;
  property_ids?: string; // number[]
}

export interface IPropstackApiFetchedEstates {
  data: IPropstackRealEstate[];
  meta: { total_count: number };
}

export interface IApiPropstackConnectReq {
  shopId: number;
  apiKey: string;
}

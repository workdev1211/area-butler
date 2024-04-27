import { PropstackPropMarketTypesEnum } from '@area-butler-types/propstack';

// 'shop_id'        ---> account id
// 'department_id'  ---> team id
// 'broker_id'      ---> user id

export enum PropstackPropStatusesEnum {
  AKQUISE = 'Akquise',
  IN_VORBEREITUNG = 'In Vorbereitung',
  IN_VERMARKTUNG = 'In Vermarktung',
  RESERVIERT = 'Reserviert',
  VERKAUFT = 'Verkauft',
  INAKTIV = 'Inaktiv',
}

export interface IApiPropstackFetchPropQueryParams {
  order?: string;
  sort_by?: string;
  status?: string; // ID of the status in which the object must be. Multiple statuses are passed separated by commas
  group?: string; // number
  q?: string;
  country?: string;
  project_id?: string; // number
  marketing_type?: PropstackPropMarketTypesEnum;
  rs_type?: string;
  expand?: string; // number
  archived?: string;
  property_ids?: string; // number[]
}

export interface IApiPropstackFetchProperties {
  apiKey: string;
  pageNumber?: number;
  queryParams?: IApiPropstackFetchPropQueryParams;
  isTest?: boolean;
}

export interface IApiPropstackFetchedProperties {
  data: IPropstackProperty[];
  meta: { total_count: number };
}

export interface IApiPropstackConnectReq {
  apiKey: string;
  shopId: number;
  brokerId: number;
  teamId?: number;
}

export interface IPropstackPrettyValue {
  value: string;
  pretty_value?: string;
}

interface IPropstackIdName {
  id: number;
  name: string;
}

export interface IPropstackPropertyStatus extends IPropstackIdName {
  color?: string;
}

export interface IPropstackLabelValue<
  T extends string | number | boolean = string,
> {
  label: string;
  value?: T;
}

export interface IPropstackCustomFields {
  objekt_webseiten_url?: string;
}

export interface IPropstackWebhookCustomFields {
  objekt_webseiten_url?: IPropstackPrettyValue;
}

export interface IPropstackBroker {
  id: number;
  shop: IPropstackShop;
  name?: string; // 'first_name' + 'last_name'
  email?: string;
  public_email?: string;
  locale?: string;
  color?: string;
  team_id?: number;
  team?: IPropstackTeam;

  salutation?: string;
  academic_title?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  avatar_url?: string;
  old_crm_id?: number;
  position?: string;
  phone?: string;
  cell?: string;
  public_phone?: string;
  public_cell?: string;
  connected?: boolean;
  department_ids?: number[];
  abstract?: string;
  description?: string;
  custom_fields?: object;
}

export interface IPropstackShop {
  id: number;
  name: string;

  locale?: string;
  email?: string;
  color?: string;
  logo_url?: string;

  alt_logo_url?: string;
  watermark_url?: string;
  favicon_url?: string;
  subdomain?: string;
  domain_name?: string;
  phone?: string;
  available_licenses?: number;
}

interface IPropstackFields {
  construction_year?: boolean;
  construction_year_unknown?: boolean;
  condition?: boolean;
  heating_type?: boolean;
  firing_types?: boolean;
  energy_certificate_availability?: boolean;
  building_energy_rating_type?: boolean;
  thermal_characteristic?: boolean;
}

export interface IPropstackLink {
  id: number;
  url?: string;
  title?: string;
  is_embedable?: boolean;
  on_landing_page?: boolean;

  is_private?: boolean;
  tags?: unknown[];
  position?: number;
  pinned?: boolean;
  variable_name?: string;
}

export interface IApiPropstackLink extends Omit<IPropstackLink, 'id'> {
  property_id: number;
}

export enum ApiPropstackImageTypeEnum {
  PROPERTY = 'Property',
  PROJECT = 'Project',
}

export interface IApiPropstackImage {
  imageable_id: number;
  imageable_type: ApiPropstackImageTypeEnum;
  is_private: boolean;
  photo: string; // base64 image
  title: string;
}

interface IPropstackFurnishing {
  balcony?: boolean;
  kitchen_complete?: boolean;
  cellar?: boolean;
  garden?: boolean;
  guest_toilet?: boolean;
  ramp?: boolean;

  built_in_kitchen?: boolean;
  lift?: boolean;
  monument?: boolean;
  energy_consumption_contains_warm_water?: boolean;
  barrier_free?: boolean;
  lodger_flat?: boolean;
  rented?: boolean;
  summer_residence_practical?: boolean;
  heating_costs_in_service_charge?: boolean;
  flat_share_suitable?: boolean;
  certificate_of_eligibility_needed?: boolean;
  price_on_inquiry?: boolean;
  short_term_constructible?: boolean;
  building_permission?: boolean;
  demolition?: boolean;
  has_canteen?: boolean;
  high_voltage?: boolean;
  terrace?: boolean;
  auto_lift?: boolean;
  goods_lift?: boolean;
  crane_runway?: boolean;
}

// obtained by fetching a property from Propstack
export interface IPropstackProperty {
  id: number;
  address: string;
  name?: string;
  short_address?: string;
  lat?: number;
  lng?: number;
  marketing_type?: PropstackPropMarketTypesEnum;
  status?: IPropstackPropertyStatus;
  broker?: IPropstackBroker;
  title?: string;
  price?: number;
  base_rent?: number;
  total_rent?: number;
  living_space?: number;
  property_space_value?: number;
  number_of_rooms?: number;
  furnishings?: IPropstackFurnishing;
  custom_fields?: IPropstackCustomFields;

  description_note?: string;
  location_note?: string;
  other_note?: string;
  long_description_note?: string;
  long_location_note?: string;
  long_other_note?: string;

  street?: string;
  house_number?: string;
  zip_code?: string;
  city?: string;
  region?: string;
  country?: string;

  documents?: object[];
  unit_id?: number;
  exposee_id?: number;
  project_id?: number;
  number_of_bed_rooms?: number;
  number_of_bath_rooms?: number;
  currency?: string;
  images?: object[];
  fields?: IPropstackFields;
  hide_address?: boolean;
  floorplans?: object[];
  links?: IPropstackLink[];
  furnishing_note?: string;
  long_furnishing_note?: string;
  object_type?: string; // enum
  rs_type?: string; // enum
  rs_category?: string; // enum
  district?: string;
}

// obtained from a webhook triggered by a Propstack event
export interface IPropstackWebhookProperty {
  id: number;
  address: string;
  name?: string;
  short_address?: string;
  lat?: number;
  lng?: number;
  marketing_type?: PropstackPropMarketTypesEnum;
  property_status?: IPropstackPropertyStatus;
  broker_id?: number; // user id
  broker?: IPropstackBroker;
  changed_attributes?: string; // comma separated names of the changed properties
  title?: IPropstackLabelValue; // 'Überschrift'
  price?: IPropstackLabelValue<number>; // 'Preis'
  base_rent?: IPropstackLabelValue<number>; // 'Kaltmiete'
  total_rent?: IPropstackLabelValue<number>; // 'Warmmiete'
  living_space?: IPropstackLabelValue<number>; // 'Wohnfläche ca.'
  property_space_value?: number;
  number_of_rooms?: IPropstackLabelValue<number>; // 'Zimmer'

  custom_fields?: IPropstackWebhookCustomFields;
  links?: IPropstackLink[];

  street?: string;
  house_number?: string;
  zip_code?: string;
  city?: string;
  region?: string;
  country?: string;

  description_note?: IPropstackLabelValue; // 'Beschreibung'
  location_note?: IPropstackLabelValue; // 'Lage'
  other_note?: IPropstackLabelValue; // 'Sonstiges'
  long_description_note?: IPropstackLabelValue; // 'Objektbeschreibung (lang)'
  long_location_note?: IPropstackLabelValue; // 'Lage (lang)'
  long_other_note?: IPropstackLabelValue; // 'Sonstiges (lang)'

  balcony?: IPropstackLabelValue<boolean>; // 'Balkon / Terrasse'
  cellar?: IPropstackLabelValue<boolean>; // 'Keller'
  garden?: IPropstackLabelValue<boolean>; // 'Garten / -mitbenutzung'
  kitchen_complete?: IPropstackLabelValue<boolean>; // 'Küche vorhanden'
  guest_toilet?: IPropstackLabelValue<boolean>; // 'Gäste-WC'
  ramp?: IPropstackLabelValue<boolean>; // 'Rampe'

  object_type?: string; // enum
  rs_type?: string; // enum
  custom_lp_address?: string;
  district?: IPropstackLabelValue; // 'Gemarkung'
  apartment_number?: string;
  hide_address?: boolean;
  location_name?: string;
  unit_id?: number;
  exposee_id?: number;
  project_id?: number;
  archived?: boolean;
  token?: string;
  group_ids?: unknown[];
  rs_category?: string;
  property_groups?: object[];
  project?: object; // project object - to be defined later
  relationships?: object[];
  folders?: IPropstackIdName[];
  public_expose_url?: string;
  translations?: object[];
  images?: object[];
  created_at_formatted?: string;
  created_at?: string;
  updated_at_formatted?: string;
  updated_at?: string;
  furnishing_note?: IPropstackLabelValue; // 'Ausstattung'
  long_furnishing_note?: IPropstackLabelValue; // 'Ausstattung (lang)'
  price_type?: IPropstackLabelValue; // 'Preistyp'
  number_of_floors?: IPropstackLabelValue<number>; // 'Etagenzahl'
  energy_efficiency_class?: IPropstackLabelValue; // 'Energieeffizienzklasse'
  number_of_parking_spaces?: IPropstackLabelValue<number>; // 'Anzahl Parkplätze'
  number_of_balconies?: IPropstackLabelValue<number>; // 'Anzahl Parkplätze'
  built_in_kitchen?: IPropstackLabelValue<boolean>; // 'Einbauküche'
}

export type TPropstackProcProperty<
  T extends IPropstackProperty | IPropstackWebhookProperty,
> = T & {
  areaButlerStatus?: string;
  areaButlerStatus2?: string;
};

interface IPropstackTeam {
  id: number;
  name: string;
  broker_ids: number[];

  logo_url?: string;

  company_name?: string;
  position?: string;
  street?: string;
  zip_code?: string;
  city?: string;
  country?: string;
  website?: string;
  cancellation_policy_note?: string;
  imprint_note?: string;
  terms_note?: string;
  privacy_note?: string;
  mail_signature?: string;
  openimmo_email?: string;
  pdf_epilog?: string;
  widerruf_letter_address?: string;
  lat?: number;
  lng?: number;
}

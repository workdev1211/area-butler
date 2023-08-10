export interface IPropstackRealEstate {
  id: number;
  name: string;
  title: string;
  street: string;
  house_number: string;
  district: string;
  region: string;
  zip_code: string;
  city: string;
  country: string;
  address: string;
  short_address: string;
  lat: number;
  lng: number;
  number_of_rooms: number;
  price: number;
  living_space: number;
  property_space_value: number;
  status: IPropstackRealEstateStatus;
  furnishings: IPropstackRealEstateFurnishings;
}

export interface IPropstackRealEstateStatus {
  id: string;
  name: PropstackRealEstStatusesEnum;
  color: string;
}

export enum PropstackRealEstStatusesEnum {
  AKQUISE = 'Akquise',
  IN_VORBEREITUNG = 'In Vorbereitung',
  IN_VERMARKTUNG = 'In Vermarktung',
  RESERVIERT = 'Reserviert',
  VERKAUFT = 'Verkauft',
  INAKTIV = 'Inaktiv',
}

export interface IPropstackRealEstateFurnishings {
  cellar: boolean;
  balcony: boolean;
  garden: boolean;
  kitchen_complete: boolean;
  ramp: boolean;
}

export interface IPropstackApiFetchEstatesRes {
  data: IPropstackRealEstate[];
  meta: { total_count: number };
}

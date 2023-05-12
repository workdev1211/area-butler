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
  name: string;
  color: string;
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

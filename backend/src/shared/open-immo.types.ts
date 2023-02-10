import { Iso3166Alpha3CountryCodesEnum } from '@area-butler-types/iso-countries';
import { ApiEnergyEfficiency } from '@area-butler-types/real-estate';

export interface IOpenImmoXmlData {
  openimmo: IOpenImmoXmlOpenImmo;
}

export interface IOpenImmoXmlOpenImmo {
  anbieter: IOpenImmoXmlVendor;
}

export interface IOpenImmoXmlVendor {
  openimmo_anid: string;
  immobilie: IOpenImmoXmlRealEstate;
}

export interface IOpenImmoXmlRealEstate {
  geo: IOpenImmoXmlGeo;
  weitere_adresse: IOpenImmoXmlAdditionAddressInfo;
  preise: IOpenImmoXmlPrices;
  flaechen: IOpenImmoXmlFlatData;
  ausstattung: IOpenImmoXmlFurnishing;
  zustand_angaben: IOpenImmoXmlCondition;
}

export interface IOpenImmoXmlCondition {
  energiepass: IOpenImmoXmlEnergyData;
}

export interface IOpenImmoXmlEnergyData {
  wertklasse: ApiEnergyEfficiency;
}

export interface IOpenImmoXmlFurnishing {
  kueche: IOpenImmoXmlKitchen;
  heizungsart: IOpenImmoXmlHeatingType;
  gartennutzung: number;
  ausricht_balkon_terrasse: IOpenImmoXmlBalcony;
  rollstuhlgerecht: boolean;
  unterkellert: { keller: 'JA' | 'NEIN' };
}

export interface IOpenImmoXmlBalcony {
  NORD: number;
  OST: number;
  SUED: number;
  WEST: number;
  NORDOST: number;
  NORDWEST: number;
  SUEDOST: number;
  SUEDWEST: number;
}

export interface IOpenImmoXmlHeatingType {
  OFEN: number;
  ETAGE: number;
  ZENTRAL: number;
  FERN: number;
  FUSSBODEN: number;
}

export interface IOpenImmoXmlKitchen {
  EBK: number;
  OFFEN: number;
  PANTRY: number;
}

export interface IOpenImmoXmlFlatData {
  nutzflaeche: number;
  gesamtflaeche: number;
  anzahl_zimmer: number;
  anzahl_stellplaetze: number;
}

export interface IOpenImmoXmlPrices {
  kaufpreis: number;
  kaufpreisnetto: number;
  kaufpreisbrutto: number;
  nettokaltmiete: number;
  kaltmiete: number;
  warmmiete: number;
}

export interface IOpenImmoXmlGeo {
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  land: IOpenImmoXmlCountry;
  geokoordinaten: IOpenImmoXmlCoordinates;
}

export interface IOpenImmoXmlCountry {
  iso_land: Iso3166Alpha3CountryCodesEnum;
}

export interface IOpenImmoXmlCoordinates {
  breitengrad: number;
  laengengrad: number;
}

export interface IOpenImmoXmlAdditionAddressInfo {
  url: string;
}

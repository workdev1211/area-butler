import { LocationIndicesEnum } from "../types/location-index";
import {
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation,
  OsmName,
  TransportationParam,
  UnitsOfTransportation,
} from "../types/types";
import {
  Iso3166_1Alpha2CountriesEnum,
  Iso3166_1Alpha3CountriesEnum,
} from "../types/location";

export const locationIndexNames: Record<LocationIndicesEnum, string> = {
  [LocationIndicesEnum.evening_entertainment]: "Restaurants, Bars & Clubs",
  [LocationIndicesEnum.health]: "Medizin & Gesundheit",
  [LocationIndicesEnum.near_supply]: "Einkaufen & Nahversorgung",
  [LocationIndicesEnum.public_transport]: "ÖPNV Anbindung",
  [LocationIndicesEnum.tourism]: "Tourismus",
  [LocationIndicesEnum.kids]: "Spielplätze & Früh-Bildung",
  [LocationIndicesEnum.culture]: "Kultur & Universitäten",
  [LocationIndicesEnum.sports]: "Sportliche Aktivitäten",
  [LocationIndicesEnum.individual_mobility]: "Individualmobilität",
};

export const defaultSnapshotConfig: ApiSearchResultSnapshotConfig = {
  showLocation: true,
  showAddress: false,
  groupItems: false,
  showStreetViewLink: false,
  fixedRealEstates: true,
  showDetailsInOnePage: true,
};

export const defaultTransportParams: TransportationParam[] = [
  {
    type: MeansOfTransportation.WALK,
    amount: 5,
    unit: UnitsOfTransportation.MINUTES,
  },
  {
    type: MeansOfTransportation.BICYCLE,
    amount: 10,
    unit: UnitsOfTransportation.MINUTES,
  },
  {
    type: MeansOfTransportation.CAR,
    amount: 15,
    unit: UnitsOfTransportation.MINUTES,
  },
];

export const defaultPoiTypes: OsmName[] = Object.values(OsmName).filter(
  (name) => ![OsmName.favorite, OsmName.property].includes(name)
);

export const iso3166Alpha3CountryNames: Record<
  Iso3166_1Alpha3CountriesEnum,
  string
> = {
  [Iso3166_1Alpha3CountriesEnum.DEU]: "Deutschland",
};

export const allowedAddrInRangeCountries: Set<Iso3166_1Alpha2CountriesEnum> =
  new Set([
    Iso3166_1Alpha2CountriesEnum.DE,
    Iso3166_1Alpha2CountriesEnum.AT,
    Iso3166_1Alpha2CountriesEnum.CH,
    Iso3166_1Alpha2CountriesEnum.NL,
    Iso3166_1Alpha2CountriesEnum.LU,
    Iso3166_1Alpha2CountriesEnum.BE,
    Iso3166_1Alpha2CountriesEnum.IT,
    Iso3166_1Alpha2CountriesEnum.ES,
  ]);

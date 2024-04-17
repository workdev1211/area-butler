import {
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation,
  OsmName,
  PoiFilterTypesEnum,
  TransportationParam,
  UnitsOfTransportation,
} from "../types/types";
import {
  Iso3166_1Alpha2CountriesEnum,
  Iso3166_1Alpha3CountriesEnum,
} from "../types/location";

export const defaultSnapshotConfig: ApiSearchResultSnapshotConfig = {
  showLocation: true,
  showAddress: false,
  groupItems: false,
  showStreetViewLink: false,
  isDetailsShown: true,
  poiFilter: {
    type: PoiFilterTypesEnum.BY_AMOUNT,
    value: 10,
  },
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

export const defaultAllowedCountries = [Iso3166_1Alpha2CountriesEnum.DE];

export const availableCountries = [
  Iso3166_1Alpha2CountriesEnum.DE,
  Iso3166_1Alpha2CountriesEnum.ES,
  Iso3166_1Alpha2CountriesEnum.CY,
  Iso3166_1Alpha2CountriesEnum.BH,
  Iso3166_1Alpha2CountriesEnum.KW,
  Iso3166_1Alpha2CountriesEnum.OM,
  Iso3166_1Alpha2CountriesEnum.QA,
  Iso3166_1Alpha2CountriesEnum.SA,
  Iso3166_1Alpha2CountriesEnum.AE,
  Iso3166_1Alpha2CountriesEnum.HR,
  Iso3166_1Alpha2CountriesEnum.AT,
  Iso3166_1Alpha2CountriesEnum.CH,
];

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
  hiddenGroups: [OsmName.property],
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
  Iso3166_1Alpha2CountriesEnum.DE, // Germany
  Iso3166_1Alpha2CountriesEnum.ES, // Spain - ES + IC
  Iso3166_1Alpha2CountriesEnum.CY, // Cyprus
  Iso3166_1Alpha2CountriesEnum.BH, // Bahrain - GCC
  Iso3166_1Alpha2CountriesEnum.KW, // Kuwait - GCC
  Iso3166_1Alpha2CountriesEnum.OM, // Oman - GCC
  Iso3166_1Alpha2CountriesEnum.QA, // Qatar - GCC
  Iso3166_1Alpha2CountriesEnum.SA, // Saudi Arabia - GCC
  Iso3166_1Alpha2CountriesEnum.AE, // United Arab Emirates - GCC
  Iso3166_1Alpha2CountriesEnum.HR, // Croatia
  Iso3166_1Alpha2CountriesEnum.AT, // Austria
  Iso3166_1Alpha2CountriesEnum.CH, // Switzerland
  Iso3166_1Alpha2CountriesEnum.NL, // Netherlands
  Iso3166_1Alpha2CountriesEnum.FR, // France
  Iso3166_1Alpha2CountriesEnum.IT, // Italy
  Iso3166_1Alpha2CountriesEnum.BE, // Belgium
  Iso3166_1Alpha2CountriesEnum.LU, // Luxembourg
  Iso3166_1Alpha2CountriesEnum.SI, // Slovenia
  Iso3166_1Alpha2CountriesEnum.SK, // Slovakia
  Iso3166_1Alpha2CountriesEnum.PT, // Portugal
];

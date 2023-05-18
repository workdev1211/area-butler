import {
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiRealEstateExtSourcesEnum,
  ApiRealEstateStatusEnum,
  IApiRealEstateStatus,
} from "../types/real-estate";

export const allFurnishing = [
  { label: "Garten", type: ApiFurnishing.GARDEN },
  { label: "Balkon", type: ApiFurnishing.BALCONY },
  { label: "Keller", type: ApiFurnishing.BASEMENT },
  { label: "Gäste WC", type: ApiFurnishing.GUEST_REST_ROOMS },
  { label: "Fußbodenheizung", type: ApiFurnishing.UNDERFLOOR_HEATING },
  { label: "Einbauküche", type: ApiFurnishing.FITTED_KITCHEN },
  { label: "Garage / Stellplatz", type: ApiFurnishing.GARAGE_PARKING_SPACE },
  { label: "Barrierefreie", type: ApiFurnishing.ACCESSIBLE },
];

export const allRealEstateCostTypes = [
  { label: "Verkauf", type: ApiRealEstateCostType.SELL },
  { label: "Monatl. Warmmiete", type: ApiRealEstateCostType.RENT_MONTHLY_WARM },
  { label: "Monatl. Kaltmiete", type: ApiRealEstateCostType.RENT_MONTHLY_COLD },
];

export const allRealEstateStatuses: IApiRealEstateStatus[] = [
  { label: "Alle", status: ApiRealEstateStatusEnum.ALL },
  { label: "In Vorbereitung", status: ApiRealEstateStatusEnum.IN_PREPARATION },
  { label: "Miete", status: ApiRealEstateStatusEnum.FOR_RENT },
  { label: "Kauf", status: ApiRealEstateStatusEnum.FOR_SALE },
  { label: "Vermietet", status: ApiRealEstateStatusEnum.RENTED },
  { label: "Verkauft", status: ApiRealEstateStatusEnum.SOLD },
  { label: "Neubau", status: ApiRealEstateStatusEnum.NEW_CONSTRUCTION },
  { label: "Archiviert", status: ApiRealEstateStatusEnum.ARCHIVED },
  { label: "Reserviert", status: ApiRealEstateStatusEnum.RESERVED },
  {
    label: "Marktbeobachtung",
    status: ApiRealEstateStatusEnum.MARKET_OBSERVATION,
  },
];

export const areaButlerEstateStatusMapping = new Map([
  ["IN VORBEREITUNG", ApiRealEstateStatusEnum.IN_PREPARATION],
  ["MIETE", ApiRealEstateStatusEnum.FOR_RENT],
  ["KAUF", ApiRealEstateStatusEnum.FOR_SALE],
  ["VERMIETET", ApiRealEstateStatusEnum.RENTED],
  ["VERKAUFT", ApiRealEstateStatusEnum.SOLD],
  ["NEUBAU", ApiRealEstateStatusEnum.NEW_CONSTRUCTION],
  ["ARCHIVIERT", ApiRealEstateStatusEnum.ARCHIVED],
  ["RESERVIERT", ApiRealEstateStatusEnum.RESERVED],
  ["MARKTBEOBACHTUNG", ApiRealEstateStatusEnum.MARKET_OBSERVATION],
]);

export const apiConnectionTypeNames: Record<
  ApiRealEstateExtSourcesEnum,
  string
> = {
  [ApiRealEstateExtSourcesEnum.PROPSTACK]: "Propstack",
  [ApiRealEstateExtSourcesEnum.ON_OFFICE]: "onOffice",
};

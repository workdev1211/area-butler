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
  { label: "Alle", status: ApiRealEstateStatusEnum.ALLE },
  { label: "In Vorbereitung", status: ApiRealEstateStatusEnum.IN_PREPARATION },
  { label: "Miete", status: ApiRealEstateStatusEnum.FOR_RENT },
  { label: "Kauf", status: ApiRealEstateStatusEnum.FOR_SALE },
  { label: "Neubau", status: ApiRealEstateStatusEnum.NEW_CONSTRUCTION },
  {
    label: "Vermietet / Verkauft",
    status: ApiRealEstateStatusEnum.RENTED_SOLD,
  },
];

export const apiConnectionTypeNames: Record<
  ApiRealEstateExtSourcesEnum,
  string
> = {
  [ApiRealEstateExtSourcesEnum.PROPSTACK]: "Propstack",
};

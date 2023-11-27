import {
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiRealEstateExtSourcesEnum,
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

export const apiConnectionTypeNames: Record<
  ApiRealEstateExtSourcesEnum,
  string
> = {
  [ApiRealEstateExtSourcesEnum.PROPSTACK]: "Propstack",
  [ApiRealEstateExtSourcesEnum.ON_OFFICE]: "onOffice",
};

export const realEstateListingsTitle = "Meine Objekte";
export const realEstateListingsTitleEmbed = "Weitere Objekte";

export const realEstateAllStatus = "all";
export const realEstAllTextStatus = "Alle";

import { LocIndexPropsEnum } from "../types/location-index";

export const locationIndexNames: Record<LocIndexPropsEnum, string> = {
  [LocIndexPropsEnum.EVENING_ENTERTAINMENT]: "Restaurants, Bars & Clubs",
  [LocIndexPropsEnum.HEALTH]: "Medizin & Gesundheit",
  [LocIndexPropsEnum.NEAR_SUPPLY]: "Einkaufen & Nahversorgung",
  [LocIndexPropsEnum.PUBLIC_TRANSPORT]: "ÖPNV Anbindung",
  [LocIndexPropsEnum.TOURISM]: "Tourismus",
  [LocIndexPropsEnum.KIDS]: "Spielplätze & Früh-Bildung",
  [LocIndexPropsEnum.CULTURE]: "Kultur & Universitäten",
  [LocIndexPropsEnum.SPORTS]: "Sportliche Aktivitäten",
  [LocIndexPropsEnum.INDIVIDUAL_MOBILITY]: "Individual mobilität",
};

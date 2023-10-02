import { LocationIndicesEnum } from "../types/location-index";

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

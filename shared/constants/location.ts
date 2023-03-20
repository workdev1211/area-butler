import { LocationIndicesEnum } from "../types/location-index";
import {
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation,
  OsmName,
  TransportationParam,
  UnitsOfTransportation,
} from "../types/types";

export const locationIndexNames: Record<LocationIndicesEnum, string> = {
  [LocationIndicesEnum.evening_entertainment]: "Restaurants, Bars & Clubs",
  [LocationIndicesEnum.health]: "Medizin & Gesundheit",
  [LocationIndicesEnum.near_supply]: "Einkaufen & Nahversorgung",
  [LocationIndicesEnum.public_transport]: "ÖPNV Anbindung",
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

export const defaultTransportationParams: TransportationParam[] = [
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

export const defaultOsmEntityNames = Object.values(OsmName).filter(
  (name) => ![OsmName.favorite, OsmName.property].includes(name)
);

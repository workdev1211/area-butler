import { ApiCoordinates, OsmName } from "./types";

export enum OverpassAvailCountryEnum {
  GERMANY = "de",
  SPAIN = "es",
  CYPRUS = "cy",
  GULF_COUNTRIES = "gcc",
  CROATIA = "hr",
  CANARY_ISLANDS = "ic",
}

export interface IApiOverpassFetchNodes {
  coordinates: ApiCoordinates;
  distanceInMeters: number;
  preferredAmenities: OsmName[];
  limit?: number;
}

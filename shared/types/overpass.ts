import { ApiCoordinates, OsmName } from "./types";

export interface IApiOverpassFetchNodes {
  coordinates: ApiCoordinates;
  distanceInMeters: number;
  preferredAmenities: OsmName[];
  limit?: number;
}

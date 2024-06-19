import { ApiCoordinates, ApiGeometry, MeansOfTransportation } from "./types";
import { ApiPreferredLocation } from "./potential-customer";

export interface EntityRoute {
  title: string;
  coordinates: ApiCoordinates;
  show: MeansOfTransportation[];
  routes: ApiRoute[];
}

export interface EntityTransitRoute {
  title: string;
  coordinates: ApiCoordinates;
  show: boolean;
  route: ApiTransitRoute;
}

export interface ApiRouteSection {
  duration: number;
  length: number;
  geometry: ApiGeometry;
  transportMode: string;
  type?: string;
}

export interface ApiRoute {
  sections: ApiRouteSection[];
  destination: ApiCoordinates;
  origin: ApiCoordinates;
  meansOfTransportation: MeansOfTransportation;
}

export interface ApiTransitRoute {
  sections: ApiRouteSection[];
  destination: ApiCoordinates;
  origin: ApiCoordinates;
}

export interface ApiRouteDestination {
  title: string;
  coordinates: ApiCoordinates;
}

export interface ApiTransitRouteQuery {
  origin: ApiCoordinates;
  destinations: ApiRouteDestination[];
  isAddressShown?: boolean;
  snapshotToken?: string;
  userEmail?: string;
}

export interface ApiRouteQuery extends ApiTransitRouteQuery {
  meansOfTransportation?: MeansOfTransportation[];
}

export interface IApiPreferredLocationRouteQuery {
  snapshotToken?: string;
  userEmail?: string;
  origin: ApiCoordinates;
  preferredLocations: ApiPreferredLocation[];
}

export interface ApiRouteQueryResultItem {
  coordinates: ApiCoordinates;
  title: string;
  routes: ApiRoute[];
}

export interface ApiTransitRouteQueryResultItem {
  coordinates: ApiCoordinates;
  title: string;
  route: ApiTransitRoute;
}

export interface IApiPreferredLocationRouteQueryResult {
  routes: EntityRoute[];
  transitRoutes: EntityTransitRoute[];
}

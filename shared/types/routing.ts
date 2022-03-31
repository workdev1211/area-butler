import { ApiCoordinates, ApiGeometry, MeansOfTransportation } from "./types";

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

export interface ApiRouteQuery {
  origin: ApiCoordinates;
  destinations: ApiRouteDestination[];
  meansOfTransportation: MeansOfTransportation[];
}

export interface ApiTransitRouteQuery {
  origin: ApiCoordinates;
  destinations: {
    title: string;
    coordinates: ApiCoordinates;
  }[];
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

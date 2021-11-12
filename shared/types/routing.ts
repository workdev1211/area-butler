import {ApiCoordinates, ApiGeometry, MeansOfTransportation} from "./types";

export interface ApiRoute {
    sections: {
        duration: number;
        length: number;
        geometry: ApiGeometry;
        transportMode: string;
    }[]
    destination: ApiCoordinates,
    origin: ApiCoordinates,
    meansOfTransportation: MeansOfTransportation
}

export interface ApiTransitRoute {
    sections: {
        duration: number;
        length: number;
        type: string;
        geometry: ApiGeometry;
        transportMode: string;
    }[]
    destination: ApiCoordinates,
    origin: ApiCoordinates,
}

export interface ApiRouteQuery {
    origin: ApiCoordinates,
    destinations: {
        title: string
        coordinates: ApiCoordinates
    }[]
    meansOfTransportation: MeansOfTransportation[]
}

export interface ApiTransitRouteQuery {
    origin: ApiCoordinates,
    destinations: {
        title: string
        coordinates: ApiCoordinates
    }[]
}

export interface ApiRouteQueryResultItem {
    coordinates: ApiCoordinates,
    title: string,
    routes: ApiRoute[]
}

export interface ApiTransitRouteQueryResultItem {
    coordinates: ApiCoordinates,
    title: string,
    route: ApiTransitRoute
}
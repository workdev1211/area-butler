import {ApiCoordinates, ApiGeometry, MeansOfTransportation} from "./types";

export interface ApiRoute {
    sections: {
        duration: number;
        length: number;
        geometry: ApiGeometry;
        transportMode: string;
    }[]
    meansOfTransportation: MeansOfTransportation

}

export interface ApiRouteQuery {
    origin: ApiCoordinates,
    destinations: {
        title: string
        coordinates: ApiCoordinates
    }[]
    meansOfTransportation: MeansOfTransportation[]
}

export interface ApiRouteQueryResultItem {
    coordinates: ApiCoordinates,
    title: string,
    routes: ApiRoute[]
}
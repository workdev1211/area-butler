import {ApiCoordinates, ApiGeometry, MeansOfTransportation} from "./types";

export interface ApiRoute {
    duration: number;
    length: number;
    geometry: ApiGeometry;
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
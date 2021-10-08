import {ApiGeometry} from "./types";

export type ApiRoutingTransportType = 'car' | 'bicycle' | 'pedestrian';

export interface ApiRoute {
    duration: number;
    length: number;
    geometry: ApiGeometry
}
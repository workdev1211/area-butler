import {HttpService, Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import {ApiCoordinates, ApiGeometry, MeansOfTransportation} from "@area-butler-types/types";
import {configService} from "../config/config.service";
import {ApiRoute, ApiTransitRoute} from "@area-butler-types/routing";
import * as poly from "@liberty-rider/flexpolyline";
import {InternalCoreModule} from "@nestjs/core/injector/internal-core-module";

// We only map a subset. Additional Info:
//https://developer.here.com/documentation/routing-api/api-reference-swagger.html

interface HereApiRoutingRequest {
    apiKey: string;
    transportMode: HereApiRoutingTransportType;
    origin: string; //{lat},{lng}
    destination: string;  //{lat},{lng}
    return: 'summary,polyline';
}


interface HereApiTransitRoutingRequest {
    apiKey: string;
    origin: string; //{lat},{lng}
    destination: string;  //{lat},{lng}
    return: 'travelSummary,polyline';
}


type HereApiRoutingTransportType = 'car' | 'bicycle' | 'pedestrian';

const mapMeansOfTransportation :{[key in keyof typeof MeansOfTransportation]: HereApiRoutingTransportType} = {
    [MeansOfTransportation.WALK]: 'pedestrian' ,
    [MeansOfTransportation.BICYCLE]: 'bicycle' ,
    [MeansOfTransportation.CAR]: 'car'
}

interface HereApiRouteSection {
    id: string;
    type: 'pedestrian' | 'vehicle' | 'transit';
    summary: {
        duration: number; //in seconds
        length: number; //in meters
        baseDuration: number;
    };
    polyline: string; // Format: https://github.com/heremaps/flexible-polyline
    transport: {
        mode: 'car' | 'bicycle' | 'pedestrian'
    }
}

interface HereApiRoute {
    id: string;
    sections: HereApiRouteSection[];
}

interface HereApiRoutingResponse {
    routes: HereApiRoute[];
}

interface HereApiTransitRouteSection {
    id: string;
    type: string;
    travelSummary: {
        duration: number; //in seconds
        length: number; //in meters
        baseDuration: number;
    };
    polyline: string;
    transport: {
        mode: string
    }
}

interface HereApiTransitRoute {
    id: string;
    sections: HereApiTransitRouteSection[];
}

interface HereApiTransitRoutingResponse {
    routes: HereApiTransitRoute[];
}

const switchCoords = (array) => {
    return array.reverse();
}

@Injectable()
export class RoutingService {
    private readonly logger = new Logger(RoutingService.name);

    constructor(private httpService: HttpService) {}

    async getRoute(origin: ApiCoordinates, destination: ApiCoordinates, meansOfTransportation: MeansOfTransportation): Promise<ApiRoute | undefined> {
        try {
            const request: HereApiRoutingRequest = {
                apiKey: configService.getHereApiKey(),
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                transportMode: mapMeansOfTransportation[meansOfTransportation],
                return: 'summary,polyline'
            };

            const {data} = await this.httpService.get<HereApiRoutingResponse>(configService.getHereRouterApiUrl(), {params: request}).toPromise();
            if (data.routes.length && data.routes.length === 1 && data.routes[0].sections && data.routes[0].sections.length) {
                return {
                    meansOfTransportation: meansOfTransportation,
                    destination,
                    origin,
                    sections: data.routes[0].sections.map(s => ({
                        duration: Math.round(s.summary.duration / 60),
                        length: s.summary.length,
                        geometry: {
                            type: 'LineString',
                            coordinates: poly.decode(s.polyline).polyline.map(switchCoords)
                        } as ApiGeometry,
                        transportMode: s.transport.mode
                    }))
                }
            }
            // we should already have returned
            this.logger.error(`Invalid route response: ${JSON.stringify(data)}`)
        } catch (e) {
            this.logger.error("Could not fetch route", e)
            throw e
        }
        throw Error("Invalid Route Response");
    }

    async getTransitRoute(origin: ApiCoordinates, destination: ApiCoordinates): Promise<ApiTransitRoute | undefined> {
        try {
            const request: HereApiTransitRoutingRequest = {
                apiKey: configService.getHereApiKey(),
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                return: 'travelSummary,polyline'
            };

            const {data} = await this.httpService.get<HereApiTransitRoutingResponse>(configService.getHereTransitRouterApiUrl(), {params: request}).toPromise();
            if (data.routes.length && data.routes.length === 1 && data.routes[0].sections && data.routes[0].sections.length) {
                return {
                    destination,
                    origin,
                    sections: data.routes[0].sections.map(s => ({
                        type: s.type,
                        duration: Math.round(s.travelSummary.duration / 60),
                        length: s.travelSummary.length,
                        geometry: {
                            type: 'LineString',
                            coordinates: poly.decode(s.polyline).polyline.map(switchCoords)
                        } as ApiGeometry,
                        transportMode: s.transport.mode
                    }))
                }
            }
            // we should already have returned
            this.logger.error(`Invalid route response: ${JSON.stringify(data)}`)
        } catch (e) {
            this.logger.error("Could not fetch transit route", e)
            throw e
        }
        throw Error("Invalid Route Response");
    }
}

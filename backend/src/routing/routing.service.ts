import {HttpService, Injectable, Logger} from '@nestjs/common';
import {ApiCoordinates, ApiGeometry, MeansOfTransportation} from "@area-butler-types/types";
import {configService} from "../config/config.service";
import {ApiRoute} from "@area-butler-types/routing";
import * as poly from "@liberty-rider/flexpolyline";

// We only map a subset. Additional Info:
//https://developer.here.com/documentation/routing-api/api-reference-swagger.html

interface HereApiRoutingRequest {
    apiKey: string;
    transportMode: HereApiRoutingTransportType;
    origin: string; //{lat},{lng}
    destination: string;  //{lat},{lng}
    return: 'summary,polyline';
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
}

interface HereApiRoute {
    id: string;
    sections: HereApiRouteSection[];
}

interface HereApiRoutingResponse {
    routes: HereApiRoute[];
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

            const {data} = await this.httpService.get<HereApiRoutingResponse>(configService.getHereRouterApiUrl(), {params:  request }).toPromise();
            if (data.routes.length && data.routes.length === 1 && data.routes[0].sections && data.routes[0].sections.length === 1) {
                const section = data.routes[0].sections[0];
                const polyline = poly.decode(section.polyline).polyline;
                return  {
                    meansOfTransportation: meansOfTransportation,
                    duration: section.summary.duration,
                    length: section.summary.length,
                    geometry: {
                        type: 'LineString',
                        coordinates: polyline.map(switchCoords)
                    } as ApiGeometry
                }
            } else {
                this.logger.error(`Invalid route response: ${JSON.stringify(data)}`)
            }
        } catch(e) {
            this.logger.error("Could not fetch route", e)
        }
    }
}

import { Injectable, Logger } from '@nestjs/common';
import * as poly from '@liberty-rider/flexpolyline';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { configService } from '../config/config.service';
import {
  ApiRoute,
  ApiRouteQuery,
  ApiRouteQueryResultItem,
  ApiTransitRoute,
  ApiTransitRouteQuery,
  ApiTransitRouteQueryResultItem,
  EntityRoute,
  EntityTransitRoute,
  IApiPreferredLocationRouteQuery,
  IApiPreferredLocationRouteQueryResult,
} from '@area-butler-types/routing';
import { MeansOfTransportation } from '@area-butler-types/types';
import ApiCoordinatesDto from '../dto/api-coordinates.dto';
import ApiGeometryDto from '../dto/api-geometry.dto';

// We only map a subset. Additional Info:
// https://developer.here.com/documentation/routing-api/api-reference-swagger.html

interface HereApiRoutingRequest {
  apiKey: string;
  transportMode: HereApiRoutingTransportType;
  origin: string; //{lat},{lng}
  destination: string; //{lat},{lng}
  return: 'summary,polyline';
}

interface HereApiTransitRoutingRequest {
  apiKey: string;
  origin: string; //{lat},{lng}
  destination: string; //{lat},{lng}
  return: 'travelSummary,polyline';
}

type HereApiRoutingTransportType = 'car' | 'bicycle' | 'pedestrian';

const mapMeansOfTransportation: {
  [key in keyof typeof MeansOfTransportation]: HereApiRoutingTransportType;
} = {
  [MeansOfTransportation.WALK]: 'pedestrian',
  [MeansOfTransportation.BICYCLE]: 'bicycle',
  [MeansOfTransportation.CAR]: 'car',
};

interface HereApiRouteSection {
  id: string;
  type: 'pedestrian' | 'vehicle' | 'transit';
  summary: {
    duration: number; // in seconds
    length: number; // in meters
    baseDuration: number;
  };
  polyline: string; // Format: https://github.com/heremaps/flexible-polyline
  transport: {
    mode: 'car' | 'bicycle' | 'pedestrian';
  };
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
    duration: number; // in seconds
    length: number; // in meters
    baseDuration: number;
  };
  polyline: string;
  transport: {
    mode: string;
  };
}

interface HereApiTransitRoute {
  id: string;
  sections: HereApiTransitRouteSection[];
}

interface HereApiTransitRoutingResponse {
  routes: HereApiTransitRoute[];
  notices?: Array<{ title: string; code: string }>;
}

const switchCoords = (array: unknown[]): unknown[] => array.reverse();

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchRoutes(query: ApiRouteQuery): Promise<ApiRouteQueryResultItem[]> {
    return Promise.all(
      query.destinations.map(async (destination) => {
        const routes = [];

        // Was hitting Here API rate limits
        for await (const transportType of query.meansOfTransportation) {
          const route = await this.fetchRoute(
            query.origin,
            destination.coordinates,
            transportType,
          );

          if (route) {
            routes.push(route);
          }
        }

        return {
          coordinates: destination.coordinates,
          title: destination.title,
          routes,
        };
      }),
    );
  }

  private async fetchRoute(
    origin: ApiCoordinatesDto,
    destination: ApiCoordinatesDto,
    meansOfTransportation: MeansOfTransportation,
  ): Promise<ApiRoute | undefined> {
    try {
      const request: HereApiRoutingRequest = {
        apiKey: configService.getHereApiKey(),
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        transportMode: mapMeansOfTransportation[meansOfTransportation],
        return: 'summary,polyline',
      };

      const { data } = await firstValueFrom<{ data: HereApiRoutingResponse }>(
        this.httpService.get<HereApiRoutingResponse>(
          configService.getHereRouterApiUrl(),
          {
            params: request,
          },
        ),
      );

      if (
        data.routes.length &&
        data.routes.length === 1 &&
        data.routes[0].sections &&
        data.routes[0].sections.length
      ) {
        return {
          meansOfTransportation: meansOfTransportation,
          destination,
          origin,
          sections: data.routes[0].sections.map((s) => ({
            duration: Math.round(s.summary.duration / 60),
            length: s.summary.length,
            geometry: {
              type: 'LineString',
              coordinates: poly.decode(s.polyline).polyline.map(switchCoords),
            } as ApiGeometryDto,
            transportMode: s.transport.mode,
          })),
        };
      }

      // we should already have returned
      this.logger.error(`Invalid route response: ${JSON.stringify(data)}`);
    } catch (e) {
      this.logger.error('Could not fetch route', e);
      throw e;
    }

    throw Error('Invalid route response');
  }

  async fetchTransitRoutes(
    query: ApiTransitRouteQuery,
  ): Promise<ApiTransitRouteQueryResultItem[]> {
    return (
      await Promise.all(
        query.destinations.map(async (destination) => {
          const transitRoute = await this.fetchTransitRoute(
            query.origin,
            destination.coordinates,
          );

          return transitRoute
            ? {
                coordinates: destination.coordinates,
                title: destination.title,
                route: transitRoute,
              }
            : [];
        }),
      )
    ).flat();
  }

  private async fetchTransitRoute(
    origin: ApiCoordinatesDto,
    destination: ApiCoordinatesDto,
  ): Promise<ApiTransitRoute | undefined> {
    try {
      const request: HereApiTransitRoutingRequest = {
        apiKey: configService.getHereApiKey(),
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        return: 'travelSummary,polyline',
      };

      const { data } = await firstValueFrom<{
        data: HereApiTransitRoutingResponse;
      }>(
        this.httpService.get<HereApiTransitRoutingResponse>(
          configService.getHereTransitRouterApiUrl(),
          { params: request },
        ),
      );

      if (data.routes.length && data.routes.length > 1) {
        this.logger.warn(`Transit route number is ${data.routes.length}`);
      }

      // "data.routes.length === 1" check was removed due to the return of two routes from Here API in case of "Am Strandkai, Hamburg"
      if (
        data.routes.length &&
        data.routes[0].sections &&
        data.routes[0].sections.length
      ) {
        return {
          destination,
          origin,
          sections: data.routes[0].sections.map((s) => ({
            type: s.type,
            duration: Math.round(s.travelSummary.duration / 60),
            length: s.travelSummary.length,
            geometry: {
              type: 'LineString',
              coordinates: poly.decode(s.polyline).polyline.map(switchCoords),
            } as ApiGeometryDto,
            transportMode: s.transport.mode,
          })),
        };
      }

      // we should already have returned
      this.logger.error(
        `Invalid transit route response: ${JSON.stringify(data)}`,
      );

      if (data.notices.some(({ code }) => code === 'noRouteFound')) {
        return;
      }
    } catch (e) {
      this.logger.error('Could not fetch transit route', e);
      throw e;
    }

    throw Error('Invalid transit route response');
  }

  async fetchPreferredLocationRoutes({
    userEmail,
    snapshotToken,
    origin,
    preferredLocations,
  }: IApiPreferredLocationRouteQuery): Promise<IApiPreferredLocationRouteQueryResult> {
    const routes: EntityRoute[] = [];
    const transitRoutes: EntityTransitRoute[] = [];

    await Promise.all(
      preferredLocations.map(async (preferredLocation) => {
        const routesResult = await this.fetchRoutes({
          userEmail,
          snapshotToken,
          meansOfTransportation: [
            MeansOfTransportation.BICYCLE,
            MeansOfTransportation.CAR,
            MeansOfTransportation.WALK,
          ],
          origin,
          destinations: [
            {
              title: preferredLocation.title,
              coordinates: preferredLocation.coordinates,
            },
          ],
        });

        routes.push({
          routes: routesResult[0].routes,
          title: routesResult[0].title,
          show: [],
          coordinates: preferredLocation.coordinates,
        });

        const transitRoutesResult = await this.fetchTransitRoutes({
          userEmail,
          snapshotToken,
          origin,
          destinations: [
            {
              title: preferredLocation.title,
              coordinates: preferredLocation.coordinates,
            },
          ],
        });

        if (transitRoutesResult.length && transitRoutesResult[0].route) {
          transitRoutes.push({
            route: transitRoutesResult[0].route,
            title: transitRoutesResult[0].title,
            show: false,
            coordinates: preferredLocation.coordinates,
          });
        }
      }),
    );

    return { routes, transitRoutes };
  }
}

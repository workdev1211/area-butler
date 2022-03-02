import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RoutingService } from './routing.service';
import { ApiRouteQuery } from '@area-butler-types/routing';

@Controller('api/routes')
export class RoutingController {
  private readonly logger = new Logger(RoutingController.name);
  constructor(private routingService: RoutingService) {}

  @Post('search')
  async searchRoutes(@Body() query: ApiRouteQuery) {
    if (query.destinations.length) {
      try {
        return await Promise.all(
          query.destinations.map(async destination => {
            return {
              coordinates: destination.coordinates,
              title: destination.title,
              routes: (
                await Promise.all(
                  query.meansOfTransportation.map(async transportType => {
                    const result = await this.routingService.getRoute(
                      query.origin,
                      destination.coordinates,
                      transportType,
                    );
                    return result;
                  }),
                )
              ).filter(value => !!value),
            };
          }),
        );
      } catch (e) {
        this.logger.error('Could not fetch routes', e);
        return [];
      }
    } else {
      return [];
    }
  }

  @Post('search-transit')
  async searchTransitRoutes(@Body() query: ApiRouteQuery) {
    if (query.destinations.length) {
      try {
        return await Promise.all(
          query.destinations.map(async destination => {
            return {
              coordinates: destination.coordinates,
              title: destination.title,
              route: await this.routingService.getTransitRoute(
                query.origin,
                destination.coordinates,
              ),
            };
          }),
        );
      } catch (e) {
        this.logger.error('Could not fetch transit routes', e);
        return [];
      }
    } else {
      return [];
    }
  }
}

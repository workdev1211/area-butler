import { Body, Controller, Logger, Post } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { ApiRouteQuery } from '@area-butler-types/routing';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import ApiRouteQueryDto from '../dto/api-route-query.dto';

@ApiTags('routes')
@Controller('api/routes')
export class RoutingController {
  private readonly logger = new Logger(RoutingController.name);
  constructor(private routingService: RoutingService) {}

  @ApiOperation({ description: 'Search routes for entity' })
  @Post('search')
  async searchRoutes(@Body() query: ApiRouteQueryDto) {
    if (query.destinations.length) {
      try {
        return await Promise.all(
          query.destinations.map(async (destination) => {
            return {
              coordinates: destination.coordinates,
              title: destination.title,
              routes: (
                await Promise.all(
                  query.meansOfTransportation.map(async (transportType) => {
                    return await this.routingService.getRoute(
                      query.origin,
                      destination.coordinates,
                      transportType,
                    );
                  }),
                )
              ).filter((value) => !!value),
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

  @ApiOperation({ description: 'Search transit routes for entity' })
  @Post('search-transit')
  async searchTransitRoutes(@Body() query: ApiRouteQueryDto) {
    if (query.destinations.length) {
      try {
        return await Promise.all(
          query.destinations.map(async (destination) => {
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

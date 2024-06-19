import {
  Body,
  Controller,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RoutingService } from './routing.service';
import {
  ApiRouteQueryResultItem,
  ApiTransitRouteQueryResultItem,
  // IApiPreferredLocationRouteQueryResult,
} from '@area-butler-types/routing';
import ApiRouteQueryDto from '../dto/api-route-query.dto';
// import ApiPreferredLocationRouteQueryDto from '../dto/api-preferred-location-route-query.dto';
import { InjectUserEmailOrIntInterceptor } from './interceptor/inject-user-email-or-int.interceptor';

@ApiTags('routes')
@Controller('api/routes')
export class RoutingController {
  private readonly logger = new Logger(RoutingController.name);

  constructor(private readonly routingService: RoutingService) {}

  @ApiOperation({ description: 'Fetch routes for entity' })
  @UseInterceptors(InjectUserEmailOrIntInterceptor)
  @Post('fetch')
  async fetchRoutes(
    @Body() query: ApiRouteQueryDto,
  ): Promise<ApiRouteQueryResultItem[]> {
    if (!query.destinations.length) {
      return [];
    }

    try {
      return this.routingService.fetchRoutes(query);
    } catch (e) {
      this.logger.error('Could not fetch routes', e);
      return [];
    }
  }

  @ApiOperation({ description: 'Fetch transit routes for entity' })
  @UseInterceptors(InjectUserEmailOrIntInterceptor)
  @Post('fetch-transit')
  async fetchTransitRoutes(
    @Body() query: ApiRouteQueryDto,
  ): Promise<ApiTransitRouteQueryResultItem[]> {
    if (!query.destinations.length) {
      return [];
    }

    try {
      return this.routingService.fetchTransitRoutes(query);
    } catch (e) {
      this.logger.error('Could not fetch transit routes', e);
      return [];
    }
  }

  // Left just in case of possible future usage
  // @ApiOperation({
  //   description: 'Fetch all routes for preferred locations',
  // })
  // @UseInterceptors(InjectUserEmailOrIntInterceptor)
  // @Post('fetch-preferred')
  // async fetchPreferredLocationRoutes(
  //   @Body() query: ApiPreferredLocationRouteQueryDto,
  // ): Promise<IApiPreferredLocationRouteQueryResult> {
  //   const emptyResults: IApiPreferredLocationRouteQueryResult = {
  //     routes: [],
  //     transitRoutes: [],
  //   };
  //
  //   if (!query.preferredLocations.length) {
  //     return emptyResults;
  //   }
  //
  //   try {
  //     return this.routingService.fetchPreferredLocationRoutes(query);
  //   } catch (e) {
  //     this.logger.error('Could not fetch routes for preferred locations', e);
  //     return emptyResults;
  //   }
  // }
}

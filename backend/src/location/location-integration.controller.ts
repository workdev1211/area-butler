import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationService } from './location.service';
import { mapSnapshotToEmbeddableMap } from './mapper/embeddable-maps.mapper';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import ApiSearchDto from '../dto/api-search.dto';
import ApiSearchResponseDto from '../dto/api-search-response.dto';
import ApiSearchResultSnapshotDto from '../dto/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotResponseDto from '../dto/api-search-result-snapshot-response.dto';
import ApiUpdateSearchResultSnapshotDto from '../dto/api-update-search-result-snapshot.dto';
import ApiUserRequestsDto from '../dto/api-user-requests.dto';
import { UserDocument } from '../user/schema/user.schema';
import { InjectUser } from '../user/inject-user.decorator';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { SubscriptionService } from '../user/subscription.service';
import { IApiMongoParams } from '@area-butler-types/types';
import ApiCreateRouteSnapshotDto from '../dto/api-create-route-snapshot.dto';
import { ApiSnapshotService } from './api-snapshot.service';
import { MongoParamPipe } from '../pipe/mongo-param.pipe';
import { MongoSortParamPipe } from '../pipe/mongo-sort-param.pipe';
import ApiOpenAiLocationDescriptionQueryDto from './dto/api-open-ai-location-description-query.dto';
import ApiOpenAiLocationRealEstateDescriptionQueryDto from './dto/api-open-ai-location-real-estate-description-query.dto';
import { InjectIntegrationUserInterceptor } from '../user/interceptor/inject-integration-user.interceptor';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

@ApiTags('location', 'integration')
@Controller('api/location-integration')
export class LocationIntegrationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly apiSnapshotService: ApiSnapshotService,
  ) {}

  @ApiOperation({
    description:
      'Search for a location, creates an entry in the "locationsearches" collection',
  })
  @UseInterceptors(InjectIntegrationUserInterceptor)
  @Post('search')
  async searchLocation(
    @InjectUser() integrationUser: TIntegrationUserDocument,
    @Body() searchData: ApiSearchDto,
  ): Promise<ApiSearchResponseDto> {
    return this.locationService.searchLocation(integrationUser, searchData);
  }

  @ApiOperation({ description: 'Create a new embeddable map' })
  @Post('snapshot')
  async createSnapshot(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    return this.locationService.createSnapshot({ user, snapshot });
  }
}

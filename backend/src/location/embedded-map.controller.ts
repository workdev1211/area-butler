import { Controller, Get, HttpException, Logger, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocationService } from './location.service';
import { mapSnapshotToEmbeddableMap } from './mapper/embeddable-maps.mapper';
import { UserService } from '../user/user.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { SubscriptionService } from '../user/subscription.service';
import { subscriptionExpiredMessage } from '../../../shared/messages/error.message';
import { ApiSubscriptionPlanType } from '@area-butler-types/subscription-plan';
import { IntegrationUserService } from '../user/integration-user.service';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';

@ApiTags('embedded-map')
@Controller('api/location/snapshot/iframe')
export class EmbeddedMapController {
  private readonly logger = new Logger(EmbeddedMapController.name);

  constructor(
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  @ApiOperation({ description: 'Fetch an embedded map' })
  @Get(':token')
  async fetchEmbeddedMap(
    @Param('token') token: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    // TODO think about moving to the location service
    const snapshotDoc = await this.locationService.fetchEmbeddedMap(token);

    if (!snapshotDoc) {
      return;
    }

    const { userId, integrationParams } = snapshotDoc;
    let isTrial = false;
    const isIntegrationSnapshot = !userId;
    let user;

    if (!isIntegrationSnapshot) {
      user = await this.userService.fetchByIdWithAssets(userId);

      const userSubscription =
        await this.subscriptionService.findActiveByUserId(user.id);

      if (!userSubscription) {
        this.logger.error(user.id, user.email);
        throw new HttpException(subscriptionExpiredMessage, 402);
      }

      isTrial = userSubscription.type === ApiSubscriptionPlanType.TRIAL;
    }

    if (isIntegrationSnapshot) {
      user = await this.integrationUserService.findOne(
        {
          integrationUserId: integrationParams.integrationUserId,
        },
        integrationParams.integrationType,
      );
    }

    if (!user) {
      throw new HttpException('Unknown user!', 400);
    }

    const realEstateListings =
      await this.realEstateListingService.fetchRealEstateListings(user);

    return mapSnapshotToEmbeddableMap(
      snapshotDoc,
      true,
      realEstateListings,
      isTrial,
      !isIntegrationSnapshot ? user.poiIcons : undefined,
    );
  }
}

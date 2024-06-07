import {
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Readable } from 'stream';
import { toBuffer } from 'qrcode';
import { FilterQuery, Types } from 'mongoose';

import { IApiFetchedEmbeddedData } from '@area-butler-types/types';
import { createDirectLink } from '../shared/functions/shared';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { subscriptionExpiredMessage } from '../../../shared/messages/error.message';
import { ApiSubscriptionPlanType } from '@area-butler-types/subscription-plan';
import { IntegrationUserService } from '../user/integration-user.service';
import { UserService } from '../user/user.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { RealEstateListingDocument } from '../real-estate-listing/schema/real-estate-listing.schema';
import { checkIsParent } from '../../../shared/functions/integration.functions';

@ApiTags('embedded-map')
@Controller('api/location/embedded')
export class EmbeddedMapController {
  private readonly logger = new Logger(EmbeddedMapController.name);

  constructor(
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ description: 'Fetch an embedded map' })
  @Get('iframe/:token')
  async fetchEmbeddedMap(
    @Param('token') token: string,
  ): Promise<IApiFetchedEmbeddedData> {
    const snapshotDoc = await this.fetchSnapshotService.fetchSnapshotDocByToken(
      token,
    );

    if (!snapshotDoc) {
      return;
    }

    const user = snapshotDoc.integrationParams
      ? await this.integrationUserService.findOne(
          snapshotDoc.integrationParams.integrationType,
          {
            integrationUserId: snapshotDoc.integrationParams.integrationUserId,
          },
        )
      : await this.userService.findById({
          userId: snapshotDoc.userId,
          withAssets: true,
          withSubscription: true,
        });

    if (!user) {
      throw new HttpException('Unknown user!', 400);
    }

    const isIntegrationUser = 'integrationUserId' in user;
    let isTrial = false;

    if (!isIntegrationUser) {
      if (!user.subscription) {
        this.logger.error(user.id, user.email);
        throw new HttpException(subscriptionExpiredMessage, 402);
      }

      isTrial = user.subscription.type === ApiSubscriptionPlanType.TRIAL;
      this.fetchSnapshotService.checkLocationExpiration(snapshotDoc);
    }

    if (isIntegrationUser) {
      if (user.parentId) {
        const parentUser = await this.integrationUserService.findByDbId(
          user.parentId,
        );

        if (parentUser && checkIsParent(user, parentUser)) {
          user.parentUser = parentUser;
        }
      }

      await this.fetchSnapshotService.checkIntSnapshotIframeExp(
        user,
        snapshotDoc,
      );
    }

    snapshotDoc.lastAccess = new Date();
    snapshotDoc.visitAmount = snapshotDoc.visitAmount + 1;
    await snapshotDoc.save();

    const snapshotRes = await this.fetchSnapshotService.getSnapshotRes(user, {
      isTrial,
      snapshotDoc,
      isEmbedded: true,
    });

    const filterQuery: FilterQuery<RealEstateListingDocument> = {
      status: snapshotDoc.config.realEstateStatus,
      status2: snapshotDoc.config.realEstateStatus2,
    };

    if (snapshotRes.snapshot.realEstate) {
      filterQuery._id = {
        $ne: new Types.ObjectId(snapshotRes.snapshot.realEstate.id),
      };
    }

    const realEstates = (
      await this.realEstateListingService.fetchRealEstateListings(
        user,
        filterQuery,
      )
    ).map((realEstate) =>
      mapRealEstateListingToApiRealEstateListing(
        user,
        realEstate,
        snapshotRes.config.showAddress,
      ),
    );

    return {
      realEstates,
      snapshotRes,
      userPoiIcons: !isIntegrationUser ? user.poiIcons : undefined,
    };
  }

  @ApiOperation({ description: 'Fetch a QrCode for an embedded map' })
  @Get('qr-code/:token')
  async fetchQrCode(@Param('token') token: string): Promise<StreamableFile> {
    const snapshotDoc = await this.fetchSnapshotService.fetchSnapshotDocByToken(
      token,
    );
    const directLink = createDirectLink(token);

    const qrCode = await toBuffer(directLink, {
      type: 'png',
      margin: 0,
    });

    return new StreamableFile(Readable.from(qrCode), {
      type: 'image/png',
      disposition: `attachment; filename="${snapshotDoc.snapshot.placesLocation.label.replace(
        /[\s|,]+/g,
        '-',
      )}-QR-Code.png"`,
    });
  }
}

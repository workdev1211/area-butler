import {
  Controller,
  Get,
  HttpException,
  Logger,
  NotFoundException,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Readable } from 'stream';
import { toBuffer } from 'qrcode';
import { FilterQuery } from 'mongoose';

import { IApiFetchedEmbeddedData } from '@area-butler-types/types';
import { createDirectLink } from '../shared/functions/shared';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { subscriptionExpiredMessage } from '../../../shared/messages/error.message';
import { ApiSubscriptionPlanType } from '@area-butler-types/subscription-plan';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { RealEstateListingDocument } from '../real-estate-listing/schema/real-estate-listing.schema';
import ApiFetchEmbeddedMapReqDto from './dto/api-fetch-embedded-map-req.dto';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';

@ApiTags('embedded-map')
@Controller('api/location/embedded')
export class EmbeddedMapController {
  private readonly logger = new Logger(EmbeddedMapController.name);

  constructor(
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  @ApiOperation({ description: 'Fetch an embedded map' })
  @Get('iframe')
  async fetchEmbeddedMap(
    @Query() { isAddressShown, token }: ApiFetchEmbeddedMapReqDto,
  ): Promise<IApiFetchedEmbeddedData> {
    const snapshotDoc = await this.fetchSnapshotService.fetchSnapshotDocByToken(
      {
        isAddressShown,
        token,
      },
    );

    if (!snapshotDoc) {
      throw new NotFoundException('Snapshot not found!');
    }

    const { integrationUser, user } = snapshotDoc;
    const resultUser = integrationUser || user;

    if ((integrationUser && user) || !resultUser) {
      throw new HttpException('Unknown user!', 400);
    }

    const isIntegrationUser = 'integrationUserId' in resultUser;
    let isTrial = false;

    if (!isIntegrationUser) {
      if (!resultUser.subscription) {
        this.logger.error(resultUser.id, resultUser.email);
        throw new HttpException(subscriptionExpiredMessage, 402);
      }

      isTrial = resultUser.subscription.type === ApiSubscriptionPlanType.TRIAL;
      this.fetchSnapshotService.checkLocationExpiration(snapshotDoc);
    }

    if (isIntegrationUser) {
      await this.fetchSnapshotService.checkIntSnapshotIframeExp(
        resultUser,
        snapshotDoc,
      );
    }

    snapshotDoc.lastAccess = new Date();
    snapshotDoc.visitAmount = snapshotDoc.visitAmount + 1;
    await snapshotDoc.save();

    const snapshotRes = await this.fetchSnapshotService.getSnapshotRes(
      resultUser,
      {
        isTrial,
        snapshotDoc,
        isAddressShown,
        isEmbedded: true,
      },
    );

    const filterQuery: FilterQuery<RealEstateListingDocument> = {
      status: snapshotRes.config.realEstateStatus,
      status2: snapshotRes.config.realEstateStatus2,
    };

    const realEstates = (
      await this.realEstateListingService.fetchRealEstateListings(
        resultUser,
        filterQuery,
      )
    ).reduce<ApiRealEstateListing[]>((result, realEstateDoc) => {
      const realEstate = mapRealEstateListingToApiRealEstateListing(
        resultUser,
        realEstateDoc,
        snapshotRes.config.showAddress,
      );

      if (realEstateDoc.id === snapshotDoc.realEstateId?.toString()) {
        if (!isAddressShown) {
          realEstate.address = undefined;
          realEstate.coordinates = snapshotRes.snapshot.location;
        }

        snapshotRes.realEstate = realEstate;
      } else {
        result.push(realEstate);
      }

      return result;
    }, []);

    return {
      realEstates,
      snapshotRes,
      poiIcons: resultUser.company.config?.poiIcons,
    };
  }

  @ApiOperation({ description: 'Fetch a QrCode for an embedded map' })
  @Get('qr-code/:token')
  async fetchQrCode(
    @Query() { isAddressShown, token }: ApiFetchEmbeddedMapReqDto,
  ): Promise<StreamableFile> {
    const snapshotDoc = await this.fetchSnapshotService.fetchSnapshotDocByToken(
      {
        isAddressShown,
        token,
        projectQuery: {
          addressToken: 1,
          token: 1,
          unaddressToken: 1,
          'config.showAddress': 1,
          'snapshot.placesLocation.label': 1,
        },
      },
    );

    const directLink = createDirectLink(snapshotDoc, isAddressShown);

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

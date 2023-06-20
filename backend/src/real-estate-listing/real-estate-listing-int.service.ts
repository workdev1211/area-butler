import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import { IApiRealEstateIntegrationParams } from '@area-butler-types/integration';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  OnOfficeIntActTypesEnum,
  TOnOfficeIntActTypes,
} from '@area-butler-types/on-office';
import { initOpenAiReqQuantity } from '../../../shared/constants/on-office/products';

@Injectable()
export class RealEstateListingIntService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
  ) {}

  async upsertByIntegrationParams(
    realEstateListing: IApiRealEstateListingSchema,
  ): Promise<RealEstateListingDocument> {
    const {
      integrationParams: { integrationId, integrationUserId, integrationType },
      ...realEstateListingData
    } = realEstateListing;

    const existingRealEstateListing =
      await this.realEstateListingModel.findOneAndUpdate(
        {
          'integrationParams.integrationId': integrationId,
          'integrationParams.integrationUserId': integrationUserId,
          'integrationParams.integrationType': integrationType,
        },
        realEstateListingData,
        { new: true },
      );

    if (existingRealEstateListing) {
      return existingRealEstateListing;
    }

    return new this.realEstateListingModel(realEstateListing).save();
  }

  async findOneOrFailByIntParams({
    integrationId,
    integrationUserId,
    integrationType,
  }: IApiRealEstateIntegrationParams): Promise<RealEstateListingDocument> {
    const existingRealEstateListing = await this.realEstateListingModel.findOne(
      {
        'integrationParams.integrationId': integrationId,
        'integrationParams.integrationUserId': integrationUserId,
        'integrationParams.integrationType': integrationType,
      },
    );

    if (!existingRealEstateListing) {
      throw new HttpException('Real estate listing not found!', 400);
    }

    return existingRealEstateListing;
  }

  async unlockProduct(
    integrationUser: TIntegrationUserDocument,
    realEstateListingId: string,
    actionType: TOnOfficeIntActTypes,
  ): Promise<void> {
    const realEstateListing = await this.realEstateListingModel.findById(
      realEstateListingId,
    );

    const iframeEndsAt = dayjs().add(6, 'months').toDate();

    // TODO think about moving the OpenAI unlocker here
    switch (actionType) {
      // TODO a blank for future
      case OnOfficeIntActTypesEnum.UNLOCK_IFRAME: {
        realEstateListing.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;

        realEstateListing.integrationParams.iframeEndsAt = iframeEndsAt;
        break;
      }

      case OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE: {
        realEstateListing.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;

        realEstateListing.integrationParams.iframeEndsAt = iframeEndsAt;
        realEstateListing.integrationParams.isOnePageExportActive = true;
        break;
      }

      case OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT: {
        realEstateListing.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;

        realEstateListing.integrationParams.iframeEndsAt = iframeEndsAt;
        realEstateListing.integrationParams.isOnePageExportActive = true;
        realEstateListing.integrationParams.isStatsFullExportActive = true;
        break;
      }
    }

    await realEstateListing.save();
  }
}

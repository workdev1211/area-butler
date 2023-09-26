import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { initOpenAiReqQuantity } from '../../../shared/constants/on-office/products';
import { ApiIntUserOnOfficeProdContTypesEnum } from '@area-butler-types/integration-user';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';

@Injectable()
export class RealEstateListingIntService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
  ) {}

  async findOneOrFailByIntParams({
    integrationId,
    integrationUserId,
    integrationType,
  }: IApiIntegrationParams): Promise<RealEstateListingDocument> {
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

  async unlockProduct(
    integrationUser: TIntegrationUserDocument,
    availProdContType: ApiIntUserOnOfficeProdContTypesEnum,
    integrationId: string,
  ): Promise<void> {
    const realEstate = await this.findOneOrFailByIntParams({
      integrationId,
      integrationUserId: integrationUser.integrationUserId,
      integrationType: integrationUser.integrationType,
    });

    const iframeEndsAt = dayjs().add(6, 'months').toDate();

    switch (availProdContType) {
      case ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        break;
      }

      case ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        realEstate.integrationParams.iframeEndsAt = iframeEndsAt;
        break;
      }

      case ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        realEstate.integrationParams.iframeEndsAt = iframeEndsAt;
        realEstate.integrationParams.isOnePageExportActive = true;
        break;
      }

      case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        realEstate.integrationParams.iframeEndsAt = iframeEndsAt;
        realEstate.integrationParams.isOnePageExportActive = true;
        realEstate.integrationParams.isStatsFullExportActive = true;
        break;
      }
    }

    await realEstate.save();
  }
}

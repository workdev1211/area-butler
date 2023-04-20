import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import { IApiRealEstateIntegrationParams } from '@area-butler-types/integration';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

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

  async unlockOnePageExport(
    integrationUser: TIntegrationUserDocument,
    realEstateListing: RealEstateListingDocument,
  ): Promise<void> {
    realEstateListing.integrationParams.isOnePageExportActive = true;
    await realEstateListing.save();
  }
}

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import { IApiIntegrationParams } from '@area-butler-types/integration';

@Injectable()
export class RealEstateListingIntService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
  ) {}

  async upsertByIntegrationParams(
    integrationParams: IApiIntegrationParams,
    realEstateListing: IApiRealEstateListingSchema,
  ): Promise<RealEstateListingDocument> {
    const existingRealEstateListing = await this.realEstateListingModel.findOne(
      { integrationParams },
    );

    if (existingRealEstateListing) {
      Object.assign(existingRealEstateListing, realEstateListing);
      return existingRealEstateListing;
    }

    return new this.realEstateListingModel(realEstateListing).save();
  }

  async findOneOrFailByIntParams(
    integrationParams: IApiIntegrationParams,
  ): Promise<RealEstateListingDocument> {
    const existingRealEstateListing = await this.realEstateListingModel.findOne(
      { integrationParams },
    );

    if (!existingRealEstateListing) {
      throw new HttpException('Real estate listing not found!', 400);
    }

    return existingRealEstateListing;
  }
}

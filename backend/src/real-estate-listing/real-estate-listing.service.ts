import { ApiUpsertRealEstateListing } from '@area-butler-types/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/schema/user.schema';
import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';

@Injectable()
export class RealEstateListingService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private realEstateListingModel: Model<RealEstateListingDocument>,
  ) {}

  async getRealEstateListings({
    id,
  }: UserDocument): Promise<RealEstateListingDocument[]> {
    return await this.realEstateListingModel.find({ userId: id });
  }

  async insertRealEstateListing(
    user: UserDocument,
    realEstateListing: ApiUpsertRealEstateListing,
  ): Promise<RealEstateListingDocument> {
    const document = {
      userId: user.id,
      ...realEstateListing,
    };
    return await new this.realEstateListingModel(document).save();
  }

  async updateRealEstateListing(
    user: UserDocument,
    id: string,
    updateRealEstateListing: Partial<ApiUpsertRealEstateListing>,
  ): Promise<RealEstateListingDocument> {
    const existingListing = await this.realEstateListingModel.findOne({ id });

    if (!existingListing) {
      throw 'Entity not found';
    }

    if (existingListing.userId !== user.id) {
      throw 'Unallowed change';
    }

    await existingListing.update(updateRealEstateListing);
    return existingListing;
  }

  async deleteRealEstateListing(user: UserDocument, id: string) {
    const existingListing = await this.realEstateListingModel.findOne({ id });

    if (!existingListing) {
      throw 'Entity not found';
    }

    if (existingListing.userId !== user.id) {
      throw 'Unallowed delete';
    }

    await existingListing.deleteOne();
  }
}

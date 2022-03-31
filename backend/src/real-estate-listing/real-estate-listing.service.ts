import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/user/schema/user.schema';
import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import ApiUpsertRealEstateListingDto from '../dto/api-upsert-real-estate-listing.dto';

@Injectable()
export class RealEstateListingService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private realEstateListingModel: Model<RealEstateListingDocument>,
    private subscriptionService: SubscriptionService,
  ) {}

  async getRealEstateListings({
    id,
  }: UserDocument): Promise<RealEstateListingDocument[]> {
    return await this.realEstateListingModel.find({ userId: id });
  }

  async insertRealEstateListing(
    user: UserDocument,
    { coordinates, ...upsertData }: ApiUpsertRealEstateListingDto,
    subscriptionCheck = true,
  ): Promise<RealEstateListingDocument> {
    subscriptionCheck &&
      (await this.subscriptionService.checkSubscriptionViolation(
        user._id,
        (subscription) => !subscription,
        'Weitere Objekterstellung ist im aktuellen Plan nicht mehr möglich',
      ));

    const documentData: any = {
      ...upsertData,
    };

    if (coordinates) {
      documentData['location'] = {
        type: 'Point',
        coordinates: [coordinates.lat, coordinates.lng],
      };
    }

    const document = {
      userId: user.id,
      ...documentData,
    };
    return await new this.realEstateListingModel(document).save();
  }

  async updateRealEstateListing(
    user: UserDocument,
    id: string,
    { coordinates, ...upsertData }: Partial<ApiUpsertRealEstateListingDto>,
  ): Promise<RealEstateListingDocument> {
    const oid = new Types.ObjectId(id);
    const existingListing = await this.realEstateListingModel.findById({
      _id: oid,
    });
    if (!existingListing) {
      throw 'Entity not found';
    }

    if (existingListing.userId !== user.id) {
      throw 'Unallowed change';
    }

    const documentData: any = {
      ...upsertData,
    };

    if (coordinates) {
      documentData['location'] = {
        type: 'Point',
        coordinates: [coordinates.lat, coordinates.lng],
      };
    }

    await existingListing.updateOne(documentData);
    return await this.realEstateListingModel.findById({
      _id: oid,
    });
  }

  async deleteRealEstateListing(user: UserDocument, id: string) {
    const oid = new Types.ObjectId(id);
    const existingListing = await this.realEstateListingModel.findById({
      _id: oid,
    });

    if (!existingListing) {
      throw 'Entity not found';
    }

    if (existingListing.userId !== user.id) {
      throw 'Unallowed delete';
    }

    await existingListing.deleteOne();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import ApiUpsertRealEstateListingDto from '../dto/api-upsert-real-estate-listing.dto';
import { UserDocument } from '../user/schema/user.schema';
import { convertStringToNumber, parseCsv } from '../shared/shared.functions';
import { ApiRealEstateCostType } from '@area-butler-types/real-estate';

@Injectable()
export class RealEstateListingService {
  private readonly logger: Logger = new Logger(RealEstateListingService.name);

  constructor(
    @InjectModel(RealEstateListing.name)
    private realEstateListingModel: Model<RealEstateListingDocument>,
    private subscriptionService: SubscriptionService,
  ) {}

  async getRealEstateListings({
    id,
  }: UserDocument): Promise<RealEstateListingDocument[]> {
    return this.realEstateListingModel.find({ userId: id });
  }

  async insertRealEstateListing(
    user: UserDocument,
    { coordinates, ...upsertData }: ApiUpsertRealEstateListingDto,
    subscriptionCheck = true,
  ): Promise<RealEstateListingDocument> {
    subscriptionCheck &&
      this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscription) => !subscription,
        'Weitere Objekterstellung ist im aktuellen Plan nicht mehr möglich',
      );

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

    return new this.realEstateListingModel(document).save();
  }

  async updateRealEstateListing(
    user: UserDocument,
    id: string,
    { coordinates, ...upsertData }: Partial<ApiUpsertRealEstateListingDto>,
  ): Promise<RealEstateListingDocument> {
    const existingListing = await this.realEstateListingModel.findById({
      _id: id,
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

    return this.realEstateListingModel.findById({
      _id: id,
    });
  }

  async deleteRealEstateListing(user: UserDocument, id: string) {
    const existingListing = await this.realEstateListingModel.findById({
      _id: id,
    });

    if (!existingListing) {
      throw 'Entity not found';
    }

    if (existingListing.userId !== user.id) {
      throw 'Unallowed delete';
    }

    await existingListing.deleteOne();
  }

  async importRealEstateListings(
    user: UserDocument,
    file: Express.Multer.File,
  ): Promise<any> {
    const realEstateListings = await parseCsv(file, ';');

    await Promise.allSettled(
      realEstateListings.map(async (listing) => {
        const listingDocuments = listing.reduce<RealEstateListingDocument[]>(
          (result, listing) => {
            const longitude = convertStringToNumber(listing[35]);
            const latitude = convertStringToNumber(listing[36]);

            if (!longitude || !latitude) {
              return result;
            }

            const minPriceAmount = convertStringToNumber(listing[23]);
            const maxPriceAmount = convertStringToNumber(listing[24]);

            let minPrice = minPriceAmount
              ? { amount: minPriceAmount, currency: '€' }
              : undefined;
            let maxPrice = maxPriceAmount
              ? { amount: maxPriceAmount, currency: '€' }
              : undefined;

            if (minPriceAmount && !maxPriceAmount) {
              minPrice = undefined;
              maxPrice = { amount: minPriceAmount, currency: '€' };
            }

            // TODO change to plainToClass via the class-transformer
            const listingDocument = {
              userId: user._id,
              name: listing[0],
              address: listing[1],
              characteristics: {
                realEstateSizeInSquareMeters: convertStringToNumber(
                  listing[20],
                ),
                propertySizeInSquareMeters: convertStringToNumber(listing[22]),
                furnishing: [],
              },
              costStructure:
                minPrice || maxPrice
                  ? {
                      minPrice,
                      maxPrice,
                      type: ApiRealEstateCostType.SELL,
                    }
                  : undefined,
              location: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
            } as RealEstateListingDocument;

            result.push(listingDocument);

            return result;
          },
          [],
        );

        await this.realEstateListingModel.insertMany(listingDocuments);
      }),
    );
  }
}

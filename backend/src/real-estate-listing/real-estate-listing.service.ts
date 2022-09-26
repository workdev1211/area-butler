import { Injectable } from '@nestjs/common';
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
import {
  ApiEnergyEfficiency,
  ApiRealEstateCostType,
  ApiRealEstateStatusEnum,
} from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';

@Injectable()
export class RealEstateListingService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly subscriptionService: SubscriptionService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async fetchRealEstateListings(
    { id: userId, parentId }: UserDocument,
    status = ApiRealEstateStatusEnum.ALLE,
  ): Promise<RealEstateListingDocument[]> {
    const filter: {
      userId: { $in: string[] };
      status?: ApiRealEstateStatusEnum;
    } = {
      userId: { $in: [userId, parentId] },
    };

    if (status !== ApiRealEstateStatusEnum.ALLE) {
      filter.status = status;
    }

    return this.realEstateListingModel.find(filter);
  }

  async insertRealEstateListing(
    user: UserDocument,
    { coordinates, ...upsertData }: ApiUpsertRealEstateListingDto,
    subscriptionCheck = true,
  ): Promise<RealEstateListingDocument> {
    subscriptionCheck &&
      this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) => !subscriptionPlan,
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
  ): Promise<number[]> {
    const chunkSize = 1000;
    const fromLine = 2;
    const realEstateListingChunks = await parseCsv(
      file,
      ',',
      fromLine,
      chunkSize,
    );

    const errorLineNumbers = [];

    const processedChunks = await Promise.allSettled(
      realEstateListingChunks.map(async (listingChunk, listingChunkIndex) => {
        const result = await Promise.allSettled(
          listingChunk.map(
            async ([name, address, ...otherParameters], listingIndex) => {
              if (!address || address === '') {
                errorLineNumbers.push(
                  (listingChunkIndex > 0 ? listingChunkIndex * chunkSize : 0) +
                    listingIndex +
                    1 +
                    (fromLine - 1),
                );

                return [];
              }

              const coordinates = (
                await this.googleGeocodeService.fetchPlaceByAddress(address)
              ).geometry?.location;

              if (coordinates) {
                return [name, address, ...otherParameters, coordinates];
              }

              errorLineNumbers.push(
                (listingChunkIndex > 0 ? listingChunkIndex * chunkSize : 0) +
                  listingIndex +
                  1 +
                  (fromLine - 1),
              );

              return [];
            },
          ),
        );

        return result.reduce((result, listing) => {
          if (listing.status === 'fulfilled' && listing.value.length > 0) {
            result.push(listing.value);
          }

          return result;
        }, []);
      }),
    );

    await Promise.allSettled(
      processedChunks.map(async (processedChunk) => {
        if (processedChunk.status !== 'fulfilled') {
          return;
        }

        const listingDocuments = processedChunk.value.reduce<
          RealEstateListingDocument[]
        >(
          (
            result,
            [
              name,
              address,
              minPriceRaw,
              maxPriceRaw,
              realEstateSizeInSquareMeters,
              propertySizeInSquareMeters,
              energyEfficiency,
              externalUrl,
              coordinates,
            ],
          ) => {
            const minPriceAmount = convertStringToNumber(minPriceRaw);
            const maxPriceAmount = convertStringToNumber(maxPriceRaw);

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
              userId: user.id,
              name: name || address,
              address,
              characteristics: {
                realEstateSizeInSquareMeters: convertStringToNumber(
                  realEstateSizeInSquareMeters,
                ),
                propertySizeInSquareMeters: convertStringToNumber(
                  propertySizeInSquareMeters,
                ),
                energyEfficiency: Object.values(ApiEnergyEfficiency).includes(
                  energyEfficiency,
                )
                  ? energyEfficiency
                  : undefined,
                furnishing: [],
              },
              costStructure:
                minPrice || maxPrice
                  ? {
                      minPrice,
                      price: maxPrice,
                      type: ApiRealEstateCostType.SELL,
                    }
                  : undefined,
              location: {
                type: 'Point',
                coordinates: [coordinates.lat, coordinates.lng],
              },
              externalUrl,
            } as RealEstateListingDocument;

            result.push(listingDocument);

            return result;
          },
          [],
        );

        await this.realEstateListingModel.insertMany(listingDocuments);
      }),
    );

    return errorLineNumbers.sort();
  }
}

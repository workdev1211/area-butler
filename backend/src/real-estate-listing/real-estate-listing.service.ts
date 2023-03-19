import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import { UserDocument } from '../user/schema/user.schema';
import {
  checkAnyStringIsEmpty,
  convertStringToNumber,
  parseCsv,
} from '../shared/shared.functions';
import {
  ApiEnergyEfficiency,
  ApiRealEstateCostType,
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import { ApiCoordinates, CsvFileFormatEnum } from '@area-butler-types/types';
import { IApiOpenAiRealEstateDescriptionQuery } from '@area-butler-types/open-ai';
import { OpenAiService } from '../open-ai/open-ai.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

interface IListingData {
  listing: unknown;
  listingIndex: number;
  chunkSize: number;
  listingChunkIndex: number;
  fromLine: number;
  fileFormat: CsvFileFormatEnum;
  errorLineNumbers: number[];
}

type TListingDocumentData = [
  name: string,
  address: string,
  minPriceRaw: string,
  maxPriceRaw: string,
  realEstateSizeInSquareMeters: string,
  propertySizeInSquareMeters: string,
  energyEfficiency: ApiEnergyEfficiency,
  externalUrl: string,
  status: ApiRealEstateStatusEnum,
  externalId: string,
  coordinates: ApiCoordinates,
];

enum OnOfficeListingStatusEnum {
  MIETE = 'MIETE',
  KAUF = 'KAUF',
}

@Injectable()
export class RealEstateListingService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly subscriptionService: SubscriptionService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly openAiService: OpenAiService,
  ) {}

  async fetchRealEstateListings(
    user: UserDocument | TIntegrationUserDocument,
    status = ApiRealEstateStatusEnum.ALLE,
  ): Promise<RealEstateListingDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;

    const filter: {
      userId?: { $in: string[] };
      integrationParams?: {
        integrationUserId: string;
        integrationType: string;
      };
      status?: ApiRealEstateStatusEnum;
    } = !isIntegrationUser
      ? {
          userId: { $in: [user.id, user.parentId] },
        }
      : {
          integrationParams: {
            integrationUserId: user.integrationUserId,
            integrationType: user.integrationType,
          },
        };

    if (status !== ApiRealEstateStatusEnum.ALLE) {
      filter.status = status;
    }

    return this.realEstateListingModel.find(filter);
  }

  async insertRealEstateListing(
    user: UserDocument,
    { coordinates, ...upsertData }: ApiUpsertRealEstateListing,
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
    { coordinates, ...upsertData }: Partial<ApiUpsertRealEstateListing>,
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
    fileFormat: CsvFileFormatEnum,
    file: Express.Multer.File,
  ): Promise<number[]> {
    // TODO change to "switch" after the feature extension
    const delimiter = fileFormat === CsvFileFormatEnum.AREA_BUTLER ? ',' : ';';
    const chunkSize = 1000;
    const fromLine = 2;
    const realEstateListingChunks = await parseCsv(
      file,
      delimiter,
      fromLine,
      chunkSize,
    );

    const errorLineNumbers = [];

    const processedChunks = await Promise.allSettled(
      realEstateListingChunks.map(async (listingChunk, listingChunkIndex) => {
        const result = await Promise.allSettled(
          listingChunk.map((listing, listingIndex) =>
            this.processRealEstateListingData({
              listing,
              listingIndex,
              chunkSize,
              listingChunkIndex,
              fromLine,
              errorLineNumbers,
              fileFormat,
            }),
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

        const listingDocuments = processedChunk.value.map(
          ([
            name,
            address,
            minPriceRaw,
            maxPriceRaw,
            realEstateSizeInSquareMeters,
            propertySizeInSquareMeters,
            energyEfficiency,
            externalUrl,
            status,
            externalId,
            coordinates,
          ]: TListingDocumentData) => {
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
              externalId,
              status,
            } as RealEstateListingDocument;

            if (fileFormat === CsvFileFormatEnum.ON_OFFICE) {
              return {
                updateOne: {
                  filter: { externalId: listingDocument.externalId },
                  update: listingDocument,
                  upsert: true,
                },
              };
            }

            return listingDocument;
          },
        );

        switch (fileFormat) {
          case CsvFileFormatEnum.ON_OFFICE: {
            await this.realEstateListingModel.bulkWrite(listingDocuments);
            break;
          }

          default: {
            await this.realEstateListingModel.insertMany(listingDocuments);
          }
        }
      }),
    );

    return errorLineNumbers.sort();
  }

  async fetchRealEstateListingById(
    user: UserDocument | TIntegrationUserDocument,
    realEstateListingId: string,
  ): Promise<RealEstateListingDocument> {
    const isIntegrationUser = 'integrationUserId' in user;
    const filter = { _id: realEstateListingId };

    Object.assign(
      filter,
      isIntegrationUser
        ? {
            integrationParams: {
              integrationUserId: user.integrationUserId,
              integrationType: user.integrationType,
            },
          }
        : { userId: user.id },
    );

    const realEstateListing = await this.realEstateListingModel.findOne(filter);

    if (!realEstateListing) {
      throw new HttpException('Unknown real estate id', 404);
    }

    return realEstateListing;
  }

  private async processRealEstateListingData({
    listing,
    listingIndex,
    listingChunkIndex,
    errorLineNumbers,
    chunkSize,
    fromLine,
    fileFormat,
  }: IListingData): Promise<TListingDocumentData | []> {
    switch (fileFormat) {
      case CsvFileFormatEnum.ON_OFFICE: {
        const [
          externalId,
          status,
          street,
          buildingNumber = '',
          zipCode,
          locality,
          country,
          price,
          propertySizeInSquareMeters,
          realEstateSizeInSquareMeters,
          name,
        ] = listing as string[];

        const processedBuildingNumber = buildingNumber.match(
          /^\d+\s?[a-zA-Z0-9äöüÄÖÜß]?$/g,
        );

        if (
          checkAnyStringIsEmpty(street, zipCode, locality) ||
          !processedBuildingNumber
        ) {
          errorLineNumbers.push(
            (listingChunkIndex > 0 ? listingChunkIndex * chunkSize : 0) +
              listingIndex +
              1 +
              (fromLine - 1),
          );

          return [];
        }

        const address = `${street} ${processedBuildingNumber[0]}, ${zipCode} ${locality}, ${country}`;

        const coordinates = (
          await this.googleGeocodeService.fetchPlaceByAddress(address)
        ).geometry?.location;

        if (coordinates) {
          return [
            name,
            address,
            undefined,
            price,
            realEstateSizeInSquareMeters,
            propertySizeInSquareMeters,
            undefined,
            undefined,
            this.convertRealEstateStatus(status),
            externalId,
            coordinates,
          ];
        }

        errorLineNumbers.push(
          (listingChunkIndex > 0 ? listingChunkIndex * chunkSize : 0) +
            listingIndex +
            1 +
            (fromLine - 1),
        );

        return [];
      }

      default: {
        const [name, address, ...otherParams] = listing as string[];

        if (checkAnyStringIsEmpty(address)) {
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
          return [
            name,
            address,
            ...otherParams,
            undefined,
            undefined,
            coordinates,
          ] as TListingDocumentData;
        }

        errorLineNumbers.push(
          (listingChunkIndex > 0 ? listingChunkIndex * chunkSize : 0) +
            listingIndex +
            1 +
            (fromLine - 1),
        );

        return [];
      }
    }
  }

  private convertRealEstateStatus(status: string): ApiRealEstateStatusEnum {
    switch (status.toUpperCase()) {
      case OnOfficeListingStatusEnum.MIETE: {
        return ApiRealEstateStatusEnum.FOR_RENT;
      }

      case OnOfficeListingStatusEnum.KAUF: {
        return ApiRealEstateStatusEnum.FOR_SALE;
      }
    }
  }

  async fetchOpenAiRealEstateDesc(
    user: UserDocument | TIntegrationUserDocument,
    { realEstateListingId }: IApiOpenAiRealEstateDescriptionQuery,
  ) {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      // TODO think about moving everything to the UserSubscriptionPipe
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.openAi &&
          !subscriptionPlan.appFeatures.openAi,
        'Das Open AI Feature ist im aktuellen Plan nicht verfügbar',
      );
    }

    const realEstateListing = await this.fetchRealEstateListingById(
      user,
      realEstateListingId,
    );

    const queryText =
      this.openAiService.getRealEstateDescriptionQuery(realEstateListing);

    return this.openAiService.fetchResponse(queryText);
  }
}

import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse as parseCsv } from 'csv-parse';
import { XMLParser } from 'fast-xml-parser';
import { plainToInstance } from 'class-transformer';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import { UserDocument } from '../user/schema/user.schema';
import {
  checkAnyStringIsEmpty,
  convertStringToNumber,
} from '../shared/shared.functions';
import {
  ApiEnergyEfficiency,
  ApiRealEstateCostType,
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import { ApiCoordinates, CsvFileFormatsEnum } from '@area-butler-types/types';
import { IOpenImmoXmlData } from '../shared/open-immo.types';
import { RealEstateListingService } from './real-estate-listing.service';
import { replaceUmlautWithEnglish } from '../../../shared/functions/shared.functions';
import ApiOpenImmoToAreaButlerDto from './dto/api-open-immo-to-area-butler.dto';
import { GeoJsonPoint } from '../shared/geo-json.types';
import ApiOnOfficeToAreaButlerDto from './dto/api-on-office-to-area-butler.dto';
import { umlautMap } from '../../../shared/constants/constants';

interface IListingData {
  listing: unknown;
  listingIndex: number;
  chunkSize: number;
  listingChunkIndex: number;
  fromLine: number;
  fileFormat: CsvFileFormatsEnum;
  errorLineNumbers: number[];
  userId: string;
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
export class RealEstateListingImportService {
  private readonly logger = new Logger(RealEstateListingImportService.name);

  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async importCsvFile(
    user: UserDocument,
    fileFormat: CsvFileFormatsEnum,
    file: Buffer,
    fromLine = 2, // to skip the column names
  ): Promise<number[]> {
    const delimiter = fileFormat === CsvFileFormatsEnum.AREA_BUTLER ? ',' : ';';
    const chunkSize = 1000;
    const realEstateListingChunks = await this.processCsv(
      file,
      delimiter,
      fromLine,
      chunkSize,
    );

    const errorLineNumbers = [];

    const processedChunks = await Promise.allSettled(
      realEstateListingChunks.map(async (listingChunk, listingChunkIndex) => {
        const result = await Promise.allSettled(
          listingChunk.map((listing, listingIndex) => {
            const listingData = {
              listing,
              listingIndex,
              chunkSize,
              listingChunkIndex,
              fromLine,
              errorLineNumbers,
              fileFormat,
              userId: '62bdb038db1f498fd8a64a6b',
            };

            return fileFormat === CsvFileFormatsEnum.PADERBORN
              ? this.processObjectListingData(listingData)
              : this.processArrayListingData(listingData);
          }),
        );

        return result.reduce((fulfilledResult, processedListing) => {
          if (
            processedListing.status === 'fulfilled' &&
            ((Array.isArray(processedListing.value) &&
              processedListing.value.length > 0) ||
              processedListing.value)
          ) {
            fulfilledResult.push(processedListing.value);
          }

          return fulfilledResult;
        }, []);
      }),
    );

    await Promise.allSettled(
      processedChunks.map(async (processedChunk) => {
        if (processedChunk.status !== 'fulfilled') {
          return;
        }

        let listingDocuments;

        switch (fileFormat) {
          case CsvFileFormatsEnum.AREA_BUTLER:
          case CsvFileFormatsEnum.ON_OFFICE: {
            listingDocuments = processedChunk.value.map(
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
                    energyEfficiency: Object.values(
                      ApiEnergyEfficiency,
                    ).includes(energyEfficiency)
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

                if (fileFormat === CsvFileFormatsEnum.ON_OFFICE) {
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

            break;
          }

          case CsvFileFormatsEnum.PADERBORN:
          default: {
            listingDocuments = processedChunk.value;
          }
        }

        switch (fileFormat) {
          case CsvFileFormatsEnum.ON_OFFICE: {
            await this.realEstateListingModel.bulkWrite(listingDocuments);
            break;
          }

          case CsvFileFormatsEnum.PADERBORN:
          default: {
            await this.realEstateListingModel.insertMany(listingDocuments);
          }
        }
      }),
    );

    return errorLineNumbers.sort();
  }

  async importXmlFile(user: UserDocument, file: Buffer): Promise<void> {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
      allowBooleanAttributes: true,
    };

    const parser = new XMLParser(options);
    const parsedData: IOpenImmoXmlData = parser.parse(file);

    const realEstate = plainToInstance(
      ApiOpenImmoToAreaButlerDto,
      parsedData.openimmo.anbieter,
    );

    await this.setAddressAndCoordinates(realEstate);

    await this.realEstateListingService.insertRealEstateListing(
      user,
      realEstate,
    );
  }

  private async processCsv(
    csvFile: Buffer,
    delimiter = ',',
    fromLine = 2, // to skip the column names
    chunkSize = 1000,
  ): Promise<Array<unknown[]>> {
    const records: Array<unknown[]> = [[]];

    const parser = parseCsv(csvFile, {
      delimiter,
      fromLine,
      columns:
        fromLine === 1 &&
        ((columnNames) =>
          columnNames.map((columnName) =>
            replaceUmlautWithEnglish(
              columnName.toLowerCase().replace(' ', '_'),
            ),
          )),
    });

    let i = 0;

    for await (const record of parser) {
      if (chunkSize > 0 && records[i].length === chunkSize) {
        i += 1;
        records[i] = [];
      }

      records[i].push(record);
    }

    return records;
  }

  private async processArrayListingData({
    listing,
    listingIndex,
    listingChunkIndex,
    errorLineNumbers,
    chunkSize,
    fromLine,
    fileFormat,
  }: IListingData): Promise<TListingDocumentData | []> {
    switch (fileFormat) {
      // TODO refactor to the usage of 'ApiOnOfficeToAreaButlerDto'
      case CsvFileFormatsEnum.ON_OFFICE: {
        const [
          externalId,
          status,
          street,
          houseNumber = '',
          zipCode,
          locality,
          country,
          price,
          propertySizeInSquareMeters,
          realEstateSizeInSquareMeters,
          name,
        ] = listing as string[];

        const processedHouseNumber = houseNumber.match(
          new RegExp(
            `^\\d+\\s?[a-zA-Z0-9${Object.keys(umlautMap).join('')}]?$`,
            'g',
          ),
        );

        if (
          checkAnyStringIsEmpty(street, zipCode, locality) ||
          !processedHouseNumber
        ) {
          errorLineNumbers.push(
            (listingChunkIndex > 0 ? listingChunkIndex * chunkSize : 0) +
              listingIndex +
              1 +
              (fromLine - 1),
          );

          return [];
        }

        const address = `${street} ${processedHouseNumber[0]}, ${zipCode} ${locality}, ${country}`;

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

  private async processObjectListingData({
    listing,
    listingIndex,
    listingChunkIndex,
    errorLineNumbers,
    chunkSize,
    fromLine,
    fileFormat,
    userId,
  }: IListingData): Promise<ApiOnOfficeToAreaButlerDto> {
    // TODO change to 'switch' in future
    if (fileFormat !== CsvFileFormatsEnum.PADERBORN) {
      return;
    }

    const {
      strasse: street,
      hausnummer: houseNumber,
      plz: zipCode,
      ort: city,
      land: country,
    } = listing as { [key: string]: string };

    const processedHouseNumber = houseNumber.match(
      new RegExp(
        `^\\d+\\s?[a-zA-Z0-9${Object.keys(umlautMap).join('')}]?$`,
        'g',
      ),
    );

    const locationAddress = processedHouseNumber
      ? `${street} ${processedHouseNumber[0]}, ${zipCode} ${city}, ${country}`
      : `${street}, ${zipCode} ${city}, ${country}`;

    const place = await this.googleGeocodeService.fetchPlace(locationAddress);

    if (!place) {
      errorLineNumbers.push(
        (listingChunkIndex > 0 ? listingChunkIndex * chunkSize : 0) +
          listingIndex +
          1 +
          (fromLine - 1),
      );

      this.logger.error(this.processObjectListingData.name, locationAddress);
      return;
    }

    Object.assign(listing, {
      userId,
      address: place.formatted_address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      } as GeoJsonPoint,
    });

    return plainToInstance(ApiOnOfficeToAreaButlerDto, listing, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
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

  private async setAddressAndCoordinates(
    realEstate: ApiUpsertRealEstateListing,
  ): Promise<void> {
    if (realEstate.address) {
      const {
        geometry: {
          location: { lat, lng },
        },
      } = await this.googleGeocodeService.fetchPlaceByAddress(
        realEstate.address,
      );

      realEstate.location = { type: 'Point', coordinates: [lat, lng] };
      return;
    }

    if (realEstate.location) {
      const { formatted_address: resultingAddress } =
        await this.googleGeocodeService.fetchPlaceByCoordinates({
          lat: realEstate.location.coordinates[0],
          lng: realEstate.location.coordinates[1],
        });

      realEstate.address = resultingAddress;
      realEstate.name = resultingAddress;
      return;
    }

    // we should've returned by now
    throw new HttpException(
      'Please, provide correct address or coordinates!',
      400,
    );
  }
}

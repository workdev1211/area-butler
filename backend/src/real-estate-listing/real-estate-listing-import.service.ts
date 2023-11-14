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
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import {
  ApiCoordinates,
  ApiGeometry,
  CsvFileFormatsEnum,
} from '@area-butler-types/types';
import { IOpenImmoXmlData } from '../shared/open-immo.types';
import { RealEstateListingService } from './real-estate-listing.service';
import { replaceUmlautWithEnglish } from '../../../shared/functions/shared.functions';
import ApiOpenImmoToAreaButlerDto from './dto/api-open-immo-to-area-butler.dto';
import { GeoJsonPoint } from '../shared/geo-json.types';
import ApiOnOfficeToAreaButlerDto from './dto/api-on-office-to-area-butler.dto';
import { umlautMap } from '../../../shared/constants/constants';
import { ApiOnOfficeEstateMarketTypesEnum } from '@area-butler-types/on-office';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';

interface IListingData {
  realEstateData: unknown;
  realEstateIndex: number;
  chunkSize: number;
  realEstateChunkIndex: number;
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
  status: string,
  externalId: string,
  coordinates: ApiCoordinates,
];

@Injectable()
export class RealEstateListingImportService {
  private readonly logger = new Logger(RealEstateListingImportService.name);

  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly locationIndexService: LocationIndexService,
  ) {}

  // TODO should be refactored and simplified
  async importCsvFile(
    user: UserDocument,
    fileFormat: CsvFileFormatsEnum,
    file: Buffer,
    fromLine?: number, // 2 to skip the column names
  ): Promise<number[]> {
    // TODO implement automatic delimiter identification - there is a package for that
    const delimiter = fileFormat === CsvFileFormatsEnum.AREA_BUTLER ? ',' : ';';
    const chunkSize = 1000;
    const resultingFromLine =
      fromLine || fileFormat === CsvFileFormatsEnum.AREA_BUTLER ? 2 : 1;

    const realEstateChunks = await this.processCsv(
      file,
      delimiter,
      resultingFromLine,
      chunkSize,
    );

    const errorLineNumbers = [];

    const processedChunks = await Promise.allSettled(
      realEstateChunks.map(async (realEstateChunk, realEstateChunkIndex) => {
        const result = await Promise.allSettled(
          realEstateChunk.map((realEstateData, realEstateIndex) => {
            const processData = {
              realEstateData,
              realEstateIndex,
              chunkSize,
              realEstateChunkIndex,
              errorLineNumbers,
              fileFormat,
              fromLine: resultingFromLine,
              userId: user.id,
            };

            return resultingFromLine === 1 &&
              fileFormat === CsvFileFormatsEnum.PADERBORN
              ? this.processObjectListingData(processData)
              : this.processArrayListingData(processData);
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

    const debugData = await Promise.allSettled(
      processedChunks.map(async (processedChunk) => {
        if (processedChunk.status !== 'fulfilled') {
          return;
        }

        let bulkWriteRecords;

        switch (fileFormat) {
          case CsvFileFormatsEnum.AREA_BUTLER:
          case CsvFileFormatsEnum.ON_OFFICE: {
            bulkWriteRecords = processedChunk.value.map(
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
                } as IApiRealEstateListingSchema;

                return listingDocument.externalId
                  ? {
                      updateOne: {
                        filter: { externalId: listingDocument.externalId },
                        update: listingDocument,
                        upsert: true,
                      },
                    }
                  : {
                      insertOne: {
                        document: listingDocument,
                      },
                    };
              },
            );

            break;
          }

          case CsvFileFormatsEnum.PADERBORN:
          default: {
            bulkWriteRecords = processedChunk.value.map((listingDocument) => {
              return listingDocument.externalId
                ? {
                    updateOne: {
                      filter: { externalId: listingDocument.externalId },
                      update: listingDocument,
                      upsert: true,
                    },
                  }
                : {
                    insertOne: {
                      document: listingDocument,
                    },
                  };
            });
          }
        }

        for await (const record of bulkWriteRecords) {
          const document =
            record.updateOne?.update || record.insertOne.document;

          const resultLocation: ApiGeometry = {
            type: 'Point',
            coordinates: [
              document.location.coordinates[1],
              document.location.coordinates[0],
            ],
          };

          const locationIndexData = await this.locationIndexService.query(
            resultLocation,
          );

          if (locationIndexData[0]) {
            document.locationIndices = locationIndexData[0].properties;
          }
        }

        await this.realEstateListingModel.bulkWrite(bulkWriteRecords);
      }),
    );

    this.logger.debug(this.importCsvFile.name, debugData);

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

    await this.realEstateListingService.createRealEstateListing(
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
              columnName.toLowerCase().replace(/ /g, '_'),
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

  // TODO completely remove after refactoring
  private async processArrayListingData({
    realEstateData,
    realEstateIndex,
    realEstateChunkIndex,
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
        ] = realEstateData as string[];

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
            (realEstateChunkIndex > 0 ? realEstateChunkIndex * chunkSize : 0) +
              realEstateIndex +
              1 +
              (fromLine - 1),
          );

          return [];
        }

        const address = `${street} ${processedHouseNumber[0]}, ${zipCode} ${locality}, ${country}`;
        const place = await this.googleGeocodeService.fetchPlace(address);
        const coordinates = place?.geometry?.location;

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
          (realEstateChunkIndex > 0 ? realEstateChunkIndex * chunkSize : 0) +
            realEstateIndex +
            1 +
            (fromLine - 1),
        );

        return [];
      }

      default: {
        const [name, address, ...otherParams] = realEstateData as string[];

        if (checkAnyStringIsEmpty(address)) {
          errorLineNumbers.push(
            (realEstateChunkIndex > 0 ? realEstateChunkIndex * chunkSize : 0) +
              realEstateIndex +
              1 +
              (fromLine - 1),
          );

          return [];
        }

        const place = await this.googleGeocodeService.fetchPlace(address);
        const coordinates = place?.geometry?.location;

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
          (realEstateChunkIndex > 0 ? realEstateChunkIndex * chunkSize : 0) +
            realEstateIndex +
            1 +
            (fromLine - 1),
        );

        return [];
      }
    }
  }

  private async processObjectListingData({
    realEstateData,
    realEstateIndex,
    realEstateChunkIndex,
    errorLineNumbers,
    chunkSize,
    fromLine,
    fileFormat,
    userId,
  }: IListingData): Promise<ApiOnOfficeToAreaButlerDto> {
    // TODO change to 'switch' in the future and change PADERBORN to ON_OFFICE
    if (fileFormat !== CsvFileFormatsEnum.PADERBORN) {
      return;
    }

    const {
      strasse: street,
      hausnummer: houseNumber,
      plz: zipCode,
      ort: city,
      land: country,
    } = realEstateData as { [key: string]: string };

    if (!street || !city) {
      return;
    }

    const resultHouseNumber = houseNumber?.match(
      new RegExp(
        `^\\d+\\s?[a-zA-Z0-9${Object.keys(umlautMap).join('')}]?$`,
        'g',
      ),
    );

    let locationAddress = resultHouseNumber
      ? `${street} ${resultHouseNumber[0]}`
      : `${street}`;

    locationAddress += ', ';

    if (zipCode) {
      locationAddress += `${zipCode} `;
    }

    locationAddress += city;

    if (country) {
      locationAddress += `, ${country}`;
    }

    const place = await this.googleGeocodeService.fetchPlace(locationAddress);

    if (!place) {
      errorLineNumbers.push(
        (realEstateChunkIndex > 0 ? realEstateChunkIndex * chunkSize : 0) +
          realEstateIndex +
          1 +
          (fromLine - 1),
      );

      this.logger.error(this.processObjectListingData.name, locationAddress);
      return;
    }

    Object.assign(realEstateData, {
      userId,
      address: place.formatted_address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      } as GeoJsonPoint,
    });

    return plainToInstance(ApiOnOfficeToAreaButlerDto, realEstateData, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }

  // TODO remove after refactoring
  private convertRealEstateStatus(status: string): string {
    switch (status.toUpperCase()) {
      case ApiOnOfficeEstateMarketTypesEnum.MIETE: {
        return ApiRealEstateStatusEnum.FOR_RENT;
      }

      case ApiOnOfficeEstateMarketTypesEnum.KAUF: {
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
      } = await this.googleGeocodeService.fetchPlaceOrFail(realEstate.address);

      realEstate.location = { type: 'Point', coordinates: [lat, lng] };
      return;
    }

    if (realEstate.location) {
      const { formatted_address: resultingAddress } =
        await this.googleGeocodeService.fetchPlaceOrFail({
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

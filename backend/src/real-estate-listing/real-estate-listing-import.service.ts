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
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import { ApiGeometry, CsvFileFormatEnum } from '@area-butler-types/types';
import { IOpenImmoXmlData } from '../shared/types/open-immo';
import { RealEstateListingService } from './real-estate-listing.service';
import { replaceUmlaut } from '../../../shared/functions/shared.functions';
import ApiOpenImmoToAreaButlerDto from './dto/api-open-immo-to-area-butler.dto';
import { GeoJsonPoint } from '../shared/types/geo-json';
import ApiOnOfficeToAreaButlerDto from './dto/api-on-office-to-area-butler.dto';
import { umlautMap } from '../../../shared/constants/constants';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { PlaceService } from '../place/place.service';

interface IListingData {
  chunkSize: number;
  errorLineNumbers: number[];
  estateDataChunkIndex: number;
  fileFormat: CsvFileFormatEnum;
  realEstateData: object;
  realEstateIndex: number;
}

@Injectable()
export class RealEstateListingImportService {
  private readonly logger = new Logger(RealEstateListingImportService.name);

  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly locationIndexService: LocationIndexService,
    private readonly placeService: PlaceService,
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  async importCsvFile(
    user: UserDocument,
    fileFormat: CsvFileFormatEnum,
    file: Buffer,
  ): Promise<number[]> {
    const chunkSize = 1000;
    const estateDataChunks = await this.parseCsv(file, fileFormat, chunkSize);
    const errorLineNumbers: number[] = [];

    const processedChunks = await Promise.allSettled(
      estateDataChunks.map(async (estateDataChunk, estateDataChunkIndex) => {
        const result = await Promise.allSettled(
          estateDataChunk.map((realEstateData, realEstateIndex) => {
            const processData: IListingData = {
              chunkSize,
              errorLineNumbers,
              estateDataChunkIndex,
              fileFormat,
              realEstateData,
              realEstateIndex,
            };

            return this.convertToRealEstate(processData);
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

        let bulkWriteRecords;

        switch (fileFormat) {
          case CsvFileFormatEnum.ON_OFFICE:
          default: {
            bulkWriteRecords = processedChunk.value.map(
              ({ externalId, ...listingDocument }) => {
                listingDocument.userId = user.id;

                return externalId
                  ? {
                      updateOne: {
                        filter: { externalId },
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

  private async parseCsv(
    csvFile: Buffer,
    fileFormat: CsvFileFormatEnum,
    chunkSize = 1000,
  ): Promise<Array<object[]>> {
    let delimiter: string;

    switch (fileFormat) {
      case CsvFileFormatEnum.ON_OFFICE:
      default: {
        delimiter = ';';
      }
    }

    const records: Array<object[]> = [[]];

    const parser = parseCsv(csvFile, {
      delimiter,
      columns: (columnNames) =>
        columnNames.map((columnName) =>
          replaceUmlaut(columnName.toLowerCase().replace(/ /g, '_')),
        ),
    });

    let i = 0;

    for await (const record of parser) {
      if (records[i].length === chunkSize) {
        i += 1;
        records[i] = [];
      }

      records[i].push(record);
    }

    return records;
  }

  private async convertToRealEstate({
    chunkSize,
    errorLineNumbers,
    estateDataChunkIndex,
    fileFormat,
    realEstateData,
    realEstateIndex,
  }: IListingData): Promise<ApiOnOfficeToAreaButlerDto> {
    const resultEstateData: { [key: string]: any } = {
      ...realEstateData,
    };

    let externalId: string;
    let address: string;

    switch (fileFormat) {
      case CsvFileFormatEnum.ON_OFFICE:
      default: {
        externalId = resultEstateData.datensatznr;

        if (externalId) {
          resultEstateData.externalId = externalId;
        }

        const {
          strasse: street,
          hausnummer: houseNumber,
          plz: zipCode,
          ort: city,
          land: country,
        } = resultEstateData;

        if (!street || !city) {
          errorLineNumbers.push(
            (estateDataChunkIndex > 0 ? estateDataChunkIndex * chunkSize : 0) +
              realEstateIndex +
              2,
          );

          return;
        }

        const resultHouseNumber = houseNumber?.match(
          new RegExp(
            `^\\d+\\s?[a-zA-Z0-9${Object.keys(umlautMap).join('')}]?$`,
            'g',
          ),
        );

        address = resultHouseNumber
          ? `${street} ${resultHouseNumber[0]}`
          : `${street}`;

        address += ', ';

        if (zipCode) {
          address += `${zipCode} `;
        }

        address += city;

        if (country) {
          address += `, ${country}`;
        }
      }
    }

    const place = await this.placeService.fetchPlace({
      isNotLimitCountries: true,
      location: address,
    });

    if (!place) {
      this.logger.debug(
        this.convertToRealEstate.name,
        resultEstateData,
        JSON.stringify(resultEstateData),
      );

      errorLineNumbers.push(
        (estateDataChunkIndex > 0 ? estateDataChunkIndex * chunkSize : 0) +
          realEstateIndex +
          2,
      );

      this.logger.error(this.convertToRealEstate.name, address);
      return;
    }

    Object.assign(resultEstateData, {
      address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      } as GeoJsonPoint,
    });

    return plainToInstance(ApiOnOfficeToAreaButlerDto, resultEstateData, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }

  private async setAddressAndCoordinates(
    realEstate: IApiRealEstateListingSchema,
  ): Promise<void> {
    if (realEstate.address) {
      const {
        geometry: {
          location: { lat, lng },
        },
      } = await this.placeService.fetchPlaceOrFail({
        isNotLimitCountries: true,
        location: realEstate.address,
      });

      realEstate.location = { type: 'Point', coordinates: [lat, lng] };
      return;
    }

    if (realEstate.location) {
      const { formatted_address: resultingAddress } =
        await this.placeService.fetchPlaceOrFail({
          isNotLimitCountries: true,
          location: {
            lat: realEstate.location.coordinates[0],
            lng: realEstate.location.coordinates[1],
          },
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

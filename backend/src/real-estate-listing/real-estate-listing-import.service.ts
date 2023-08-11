import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse as parseCsv } from 'csv-parse';
import { XMLParser } from 'fast-xml-parser';
import { plainToInstance } from 'class-transformer';
import * as dayjs from 'dayjs';

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
  ApiRealEstateExtSourcesEnum,
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import {
  ApiCoordinates,
  CsvFileFormatsEnum,
  IApiUserApiConnectionSettingsReq,
} from '@area-butler-types/types';
import { IOpenImmoXmlData } from '../shared/open-immo.types';
import { RealEstateListingService } from './real-estate-listing.service';
import {
  createChunks,
  replaceUmlautWithEnglish,
} from '../../../shared/functions/shared.functions';
import ApiOpenImmoToAreaButlerDto from './dto/api-open-immo-to-area-butler.dto';
import { GeoJsonPoint } from '../shared/geo-json.types';
import ApiOnOfficeToAreaButlerDto from './dto/api-on-office-to-area-butler.dto';
import { umlautMap } from '../../../shared/constants/constants';
import {
  PROPSTACK_ESTATES_PER_PAGE,
  PropstackApiService,
} from '../client/propstack/propstack-api.service';
import ApiPropstackToAreaButlerDto from './dto/api-propstack-to-area-butler.dto';
import { apiConnectionTypeNames } from '../../../shared/constants/real-estate';
import { UserService } from '../user/user.service';
import { ApiOnOfficeEstateMarketTypesEnum } from '@area-butler-types/on-office';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeResourceTypesEnum,
  IApiOnOfficeRealEstate,
  IApiOnOfficeRequest,
} from '@area-butler-types/on-office';
import {
  ON_OFFICE_ESTATES_PER_PAGE,
  OnOfficeApiService,
} from '../client/on-office/on-office-api.service';
import {
  ApiOnOfficeRealEstStatusByUserEmailsEnum,
  setRealEstateStatusByUserEmail,
} from './mapper/real-estate-listing-import.mapper';

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

@Injectable()
export class RealEstateListingImportService {
  private readonly logger = new Logger(RealEstateListingImportService.name);

  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly propstackApiService: PropstackApiService,
    private readonly onOfficeApiService: OnOfficeApiService,
    private readonly userService: UserService,
  ) {}

  // TODO should be refactored and simplified
  async importCsvFile(
    user: UserDocument,
    fileFormat: CsvFileFormatsEnum,
    file: Buffer,
    fromLine?: number, // 2 to skip the column names
  ): Promise<number[]> {
    const delimiter = fileFormat === CsvFileFormatsEnum.AREA_BUTLER ? ',' : ';';
    const chunkSize = 1000;
    const resultingFromLine =
      fromLine || fileFormat === CsvFileFormatsEnum.AREA_BUTLER ? 2 : 1;

    const realEstateListingChunks = await this.processCsv(
      file,
      delimiter,
      resultingFromLine,
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
              errorLineNumbers,
              fileFormat,
              fromLine: resultingFromLine,
              userId: user.id,
            };

            return resultingFromLine === 1 &&
              fileFormat === CsvFileFormatsEnum.PADERBORN
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

    await this.realEstateListingService.createRealEstateListing(
      user,
      realEstate,
    );
  }

  async importFromCrm(
    user: UserDocument,
    connectionType: ApiRealEstateExtSourcesEnum,
  ): Promise<number[]> {
    this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) => !subscriptionPlan,
      'Weitere Objektimport ist im aktuellen Plan nicht mehr möglich',
    );

    const connectionSettings = user.apiConnections[connectionType];

    if (!connectionSettings) {
      throw new HttpException('Unknown connection type is provided!', 400);
    }

    const errorIds = [];

    switch (connectionType) {
      case ApiRealEstateExtSourcesEnum.PROPSTACK: {
        const {
          data,
          meta: { total_count: totalCount },
        } = await this.propstackApiService.fetchRealEstates(
          connectionSettings.apiKey,
          1,
        );

        const realEstates = [...data];

        if (totalCount > PROPSTACK_ESTATES_PER_PAGE) {
          const numberOfPages = Math.ceil(
            totalCount / PROPSTACK_ESTATES_PER_PAGE,
          );

          for (let i = 2; i < numberOfPages + 1; i++) {
            const { data } = await this.propstackApiService.fetchRealEstates(
              connectionSettings.apiKey,
              i,
            );

            realEstates.push(...data);
          }
        }

        const chunks = createChunks(realEstates, 100);

        for (const chunk of chunks) {
          const bulkOperations = [];

          for (const realEstate of chunk) {
            if (!realEstate.address) {
              errorIds.push(realEstate.id);
              continue;
            }

            const place = await this.googleGeocodeService.fetchPlace(
              realEstate.address,
            );

            if (!place) {
              errorIds.push(realEstate.id);
              continue;
            }

            realEstate.lat = place.geometry.location.lat;
            realEstate.lng = place.geometry.location.lng;

            const areaButlerRealEstate = plainToInstance(
              ApiPropstackToAreaButlerDto,
              realEstate,
              { exposeUnsetFields: false },
            );

            bulkOperations.push({
              updateOne: {
                filter: {
                  userId: user.id,
                  externalSource: ApiRealEstateExtSourcesEnum.PROPSTACK,
                  externalId: realEstate.id,
                },
                update: areaButlerRealEstate,
                upsert: true,
              },
            });
          }

          await this.realEstateListingModel.bulkWrite(bulkOperations);
        }

        break;
      }

      case ApiRealEstateExtSourcesEnum.ON_OFFICE: {
        const actionId = ApiOnOfficeActionIdsEnum.READ;
        const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
        const timestamp = dayjs().unix();
        const token = connectionSettings.token;
        const secret = connectionSettings.secret;

        let signature = this.onOfficeApiService.generateSignature(
          [timestamp, token, resourceType, actionId].join(''),
          secret,
          'base64',
        );

        const request: IApiOnOfficeRequest = {
          token,
          request: {
            actions: [
              {
                timestamp,
                hmac: signature,
                hmac_version: 2,
                actionid: actionId,
                resourceid: '',
                identifier: '',
                resourcetype: resourceType,
                parameters: {
                  listlimit: ON_OFFICE_ESTATES_PER_PAGE,
                  listoffset: 0,
                  data: [
                    'Id',
                    'objekttitel',
                    'strasse',
                    'hausnummer',
                    'plz',
                    'ort',
                    'land',
                    'breitengrad',
                    'laengengrad',
                    'anzahl_zimmer',
                    'wohnflaeche',
                    'grundstuecksflaeche',
                    'energyClass',
                    'kaufpreis',
                    'waehrung',
                    'kaltmiete',
                    'warmmiete',
                    'anzahl_balkone',
                    'unterkellert',
                    'vermarktungsart',
                    'objektnr_extern', // external id
                    'status2', // used by ReMax
                  ],
                },
              },
            ],
          },
        };

        const initialResponse = await this.onOfficeApiService.sendRequest(
          request,
        );

        this.onOfficeApiService.checkResponseIsSuccess(
          this.importFromCrm.name,
          'The OnOffice import failed!',
          request,
          initialResponse,
        );

        const totalCount =
          initialResponse.response.results[0].data.meta.cntabsolute;

        const realEstates: IApiOnOfficeRealEstate[] =
          initialResponse.response.results[0].data.records.map(
            ({ elements }) => elements,
          );

        if (totalCount > ON_OFFICE_ESTATES_PER_PAGE) {
          const numberOfPages = Math.ceil(
            totalCount / ON_OFFICE_ESTATES_PER_PAGE,
          );

          for (let i = 2; i < numberOfPages + 1; i++) {
            const timestamp = dayjs().unix();

            signature = this.onOfficeApiService.generateSignature(
              [timestamp, token, resourceType, actionId].join(''),
              secret,
              'base64',
            );

            request.request.actions[0].timestamp = timestamp;
            request.request.actions[0].hmac = signature;
            request.request.actions[0].parameters.listoffset =
              (i - 1) * ON_OFFICE_ESTATES_PER_PAGE;

            const response = await this.onOfficeApiService.sendRequest(request);

            this.onOfficeApiService.checkResponseIsSuccess(
              this.importFromCrm.name,
              'The OnOffice import failed!',
              request,
              response,
            );

            realEstates.push(
              ...response.response.results[0].data.records.map(
                ({ elements }) => elements,
              ),
            );
          }
        }

        // LEFT FOR DEBUGGING PURPOSES
        // const testData = [''];
        const chunks = createChunks(realEstates, 100);

        for (const chunk of chunks) {
          const bulkOperations = [];

          for (const realEstate of chunk) {
            const {
              strasse: street,
              hausnummer: houseNumber,
              plz: zipCode,
              ort: city,
              land: country,
            } = realEstate;

            const processedHouseNumber = houseNumber.match(
              new RegExp(
                `^\\d+\\s?[a-zA-Z0-9${Object.keys(umlautMap).join('')}]?$`,
                'g',
              ),
            );

            const locationAddress = processedHouseNumber
              ? `${street} ${processedHouseNumber[0]}, ${zipCode} ${city}, ${country}`
              : `${street}, ${zipCode} ${city}, ${country}`;

            const place = await this.googleGeocodeService.fetchPlace(
              locationAddress,
            );

            if (!place) {
              errorIds.push(realEstate.Id);
              continue;
            }

            const userEmail = user.email.toLowerCase();

            if (
              Object.values<string>(
                ApiOnOfficeRealEstStatusByUserEmailsEnum,
              ).includes(userEmail)
            ) {
              setRealEstateStatusByUserEmail(userEmail, realEstate);
            }

            // LEFT FOR DEBUGGING PURPOSES
            // testData.push(
            //   `${realEstate.objektnr_extern || realEstate.Id}: ${
            //     realEstate.status2
            //   }, ${realEstate.vermarktungsart}, ${
            //     (realEstate as IApiOnOfficeProcessedRealEstate).areaButlerStatus
            //   }`,
            // );

            Object.assign(realEstate, {
              userId: user.id,
              address: place.formatted_address,
              location: {
                type: 'Point',
                coordinates: [
                  place.geometry.location.lat,
                  place.geometry.location.lng,
                ],
              } as GeoJsonPoint,
            });

            const areaButlerRealEstate = plainToInstance(
              ApiOnOfficeToAreaButlerDto,
              realEstate,
              { exposeUnsetFields: false },
            );

            bulkOperations.push({
              updateOne: {
                filter: {
                  userId: user.id,
                  externalSource: ApiRealEstateExtSourcesEnum.ON_OFFICE,
                  externalId: areaButlerRealEstate.externalId,
                },
                update: areaButlerRealEstate,
                upsert: true,
              },
            });
          }

          await this.realEstateListingModel.bulkWrite(bulkOperations);
        }

        // LEFT FOR DEBUGGING PURPOSES
        // testData.push('');
        // this.logger.log(testData.join('\n'));

        break;
      }
    }

    if (errorIds.length) {
      this.logger.debug(
        `The following ${
          apiConnectionTypeNames[connectionType]
        } ids ${errorIds.join(', ')} has not been imported for the user ${
          user.email
        }.`,
      );
    }

    return errorIds;
  }

  async testApiConnection(
    user: UserDocument,
    { connectionType, ...connectionSettings }: IApiUserApiConnectionSettingsReq,
  ): Promise<void> {
    this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) => !subscriptionPlan,
      'Weitere Objektimport ist im aktuellen Plan nicht mehr möglich',
    );

    try {
      switch (connectionType) {
        case ApiRealEstateExtSourcesEnum.PROPSTACK: {
          try {
            await this.propstackApiService.fetchRealEstateById(
              connectionSettings.apiKey,
              1,
            );
          } catch (e) {
            if (e.response.status === 401) {
              throw new HttpException('Propstack authentication failed!', 401);
            }
          }

          break;
        }

        case ApiRealEstateExtSourcesEnum.ON_OFFICE: {
          const timestamp = dayjs().unix();
          const { token, secret } = connectionSettings;
          const resourceType = ApiOnOfficeResourceTypesEnum.FIELDS;
          const actionId = ApiOnOfficeActionIdsEnum.GET;

          const signature = this.onOfficeApiService.generateSignature(
            [timestamp, token, resourceType, actionId].join(''),
            secret,
            'base64',
          );

          const request: IApiOnOfficeRequest = {
            token,
            request: {
              actions: [
                {
                  timestamp,
                  hmac: signature,
                  hmac_version: 2,
                  actionid: actionId,
                  resourceid: '',
                  identifier: '',
                  resourcetype: resourceType,
                  parameters: {
                    labels: true,
                    language: 'ENG',
                    modules: ['estate'],
                  },
                },
              ],
            },
          };

          const response = await this.onOfficeApiService.sendRequest(request);

          // LEFT FOR DEBUGGING PURPOSES
          // RETURNS THE LIST OF AVAILABLE FIELDS FOR ONOFFICE REAL ESTATE ENTITY
          // this.logger.debug(
          //   response.response.results[0].data.records[0].elements,
          // );

          const {
            status: { code, errorcode, message },
          } = response;

          if (!(code === 200 && errorcode === 0 && message === 'OK')) {
            throw new HttpException('OnOffice authentication failed!', 401);
          }
        }
      }

      await this.userService.updateApiConnections(user.id, {
        connectionType,
        ...connectionSettings,
      });
    } catch (e) {
      await this.userService.updateApiConnections(user.id, {
        connectionType,
      });

      throw e;
    }
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
          await this.googleGeocodeService.fetchPlace(address)
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
          await this.googleGeocodeService.fetchPlace(address)
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
    // TODO change to 'switch' in future and change PADERBORN to ON_OFFICE
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

  // TODO remove after refactoring
  private convertRealEstateStatus(status: string): ApiRealEstateStatusEnum {
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
      } = await this.googleGeocodeService.fetchPlace(realEstate.address);

      realEstate.location = { type: 'Point', coordinates: [lat, lng] };
      return;
    }

    if (realEstate.location) {
      const { formatted_address: resultingAddress } =
        await this.googleGeocodeService.fetchPlace({
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

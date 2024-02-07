import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import * as dayjs from 'dayjs';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import { UserDocument } from '../user/schema/user.schema';
import {
  ApiRealEstateExtSourcesEnum,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import { IApiUserApiConnectSettingsReq } from '@area-butler-types/types';
import { createChunks } from '../../../shared/functions/shared.functions';
import { GeoJsonPoint } from '../shared/geo-json.types';
import ApiOnOfficeToAreaButlerDto from './dto/api-on-office-to-area-butler.dto';
import { umlautMap } from '../../../shared/constants/constants';
import {
  PROPSTACK_PROPERTIES_PER_PAGE,
  PropstackApiService,
} from '../client/propstack/propstack-api.service';
import ApiPropstackFetchToAreaButlerDto from './dto/api-propstack-fetch-to-area-butler.dto';
import { apiConnectTypeNames } from '../../../shared/constants/real-estate';
import { UserService } from '../user/user.service';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeResourceTypesEnum,
  IApiOnOfficeRealEstate,
  IApiOnOfficeReqActParams,
  IApiOnOfficeRequest,
  IApiOnOfficeSyncEstatesFilterParams,
} from '@area-butler-types/on-office';
import {
  ON_OFFICE_ESTATES_PER_PAGE,
  OnOfficeApiService,
} from '../client/on-office/on-office-api.service';
import {
  ApiOnOfficeRealEstStatusByUserEmailsEnum,
  setRealEstateStatusByUserEmail,
} from './mapper/real-estate-on-office-import.mapper';
import { IApiPropstackFetchPropQueryParams } from '../shared/propstack.types';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
} from '@area-butler-types/integration-user';
import { RealEstateListingService } from './real-estate-listing.service';
import { IApiSyncEstatesIntFilterParams } from '@area-butler-types/integration';
import { getProcUpdateQuery } from '../shared/shared.functions';

@Injectable()
export class RealEstateCrmImportService {
  private readonly logger = new Logger(RealEstateCrmImportService.name);

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

  async importFromCrm(
    user: UserDocument,
    connectType: ApiRealEstateExtSourcesEnum,
  ): Promise<string[]> {
    this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) => !subscriptionPlan,
      'Weitere Objektimport ist im aktuellen Plan nicht mehr möglich',
    );

    const connectSettings = user.apiConnections[connectType];

    if (!connectSettings) {
      throw new HttpException('Unknown connection type is provided!', 400);
    }

    let errorIds: string[];

    switch (connectType) {
      case ApiRealEstateExtSourcesEnum.PROPSTACK: {
        errorIds = await this.importFromPropstack(user);
        break;
      }

      case ApiRealEstateExtSourcesEnum.ON_OFFICE: {
        errorIds = await this.importFromOnOffice(user);
        break;
      }
    }

    if (errorIds.length) {
      this.logger.debug(
        `The following ${apiConnectTypeNames[connectType]} ids ${errorIds.join(
          ', ',
        )} has not been imported for the user ${user.email}.`,
      );
    }

    return errorIds;
  }

  async testApiConnection(
    user: UserDocument,
    { connectType, ...connectSettings }: IApiUserApiConnectSettingsReq,
  ): Promise<void> {
    this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) => !subscriptionPlan,
      'Weitere Objektimport ist im aktuellen Plan nicht mehr möglich',
    );

    try {
      switch (connectType) {
        case ApiRealEstateExtSourcesEnum.PROPSTACK: {
          try {
            await this.propstackApiService.fetchProperties({
              apiKey: connectSettings.apiKey,
              isTest: true,
            });
          } catch (e) {
            if (e.response.status === 401) {
              throw new HttpException('Propstack authentication failed!', 401);
            }
          }

          break;
        }

        case ApiRealEstateExtSourcesEnum.ON_OFFICE: {
          const timestamp = dayjs().unix();
          const { token, secret } = connectSettings;
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
            throw new HttpException('onOffice authentication failed!', 401);
          }
        }
      }

      await this.userService.updateApiConnections(user.id, {
        connectType,
        ...connectSettings,
      });
    } catch (e) {
      await this.userService.updateApiConnections(user.id, {
        connectType,
      });

      throw e;
    }
  }

  async importFromPropstack(
    user: UserDocument | TIntegrationUserDocument,
    queryParams: Pick<
      IApiPropstackFetchPropQueryParams,
      'status' | 'marketing_type'
    > = {},
  ): Promise<string[]> {
    const isIntegrationUser = 'integrationUserId' in user;
    const errorIds: string[] = [];
    // TODO should be removed in the future after some testing because now the status fields are completely custom
    // const processedUserEmail = (
    //   isIntegrationUser ? user.parameters.email : user.email
    // )?.toLowerCase();
    // const customStatuses = propstackCustomSyncStatuses[processedUserEmail];

    const apiKey = isIntegrationUser
      ? (user.parameters as IApiIntUserPropstackParams).apiKey
      : user.apiConnections[ApiRealEstateExtSourcesEnum.PROPSTACK]?.apiKey;

    if (!apiKey) {
      throw new HttpException('Propstack authentication failed!', 401);
    }

    // TODO should be removed in the future after some testing because now the status fields are completely custom
    // if (customStatuses) {
    //   queryParams.status = customStatuses.reduce((result, { id }) => {
    //     result += `${id},`;
    //     return result;
    //   }, '');
    //
    //   queryParams.status = queryParams.status.slice(0, -1);
    // }

    const {
      data,
      meta: { total_count: totalCount },
    } = await this.propstackApiService.fetchProperties({
      queryParams,
      apiKey,
    });

    const properties = [...data];

    if (totalCount > PROPSTACK_PROPERTIES_PER_PAGE) {
      const numberOfPages = Math.ceil(
        totalCount / PROPSTACK_PROPERTIES_PER_PAGE,
      );

      for (let i = 2; i < numberOfPages + 1; i += 1) {
        const { data } = await this.propstackApiService.fetchProperties({
          queryParams,
          apiKey,
          pageNumber: i,
        });

        properties.push(...data);
      }
    }

    const chunks = createChunks(properties, 100);

    this.logger.log(
      `User ${
        isIntegrationUser
          ? `${user.integrationUserId} / ${user.integrationType}`
          : user.id
      } is going to import ${totalCount} real estates from Propstack split into ${
        chunks.length
      } chunks.`,
    );

    for (const chunk of chunks) {
      const bulkOperations = [];

      for (const property of chunk) {
        if (!property.address) {
          errorIds.push(`${property.id}`);
          continue;
        }

        const place = await this.googleGeocodeService.fetchPlace(
          property.address,
        );

        if (!place) {
          errorIds.push(`${property.id}`);
          continue;
        }

        // TODO should be removed in the future after some testing because now the status fields are completely custom
        // if (customStatuses) {
        //   processCustomPropstackStatus(processedUserEmail, realEstate);
        // }

        const estateData: Partial<IApiRealEstateListingSchema> = {
          address: property.address,
          location: {
            type: 'Point',
            coordinates: [
              place.geometry.location.lat,
              place.geometry.location.lng,
            ],
          },
        };

        if (isIntegrationUser) {
          estateData.integrationParams = {
            integrationUserId: user.integrationUserId,
            integrationId: `${property.id}`,
            integrationType: user.integrationType,
          };
        }

        if (!isIntegrationUser) {
          estateData.userId = user.id;
          estateData.externalId = `${property.id}`;
          estateData.externalSource = ApiRealEstateExtSourcesEnum.PROPSTACK;
        }

        Object.assign(property, estateData);

        const areaButlerRealEstate = plainToInstance(
          ApiPropstackFetchToAreaButlerDto,
          property,
        ) as IApiRealEstateListingSchema;

        await this.realEstateListingService.assignLocationIndices(
          areaButlerRealEstate,
        );

        const filterQuery: FilterQuery<IApiRealEstateListingSchema> =
          isIntegrationUser
            ? {
                'integrationParams.integrationUserId':
                  areaButlerRealEstate.integrationParams.integrationUserId,
                'integrationParams.integrationId':
                  areaButlerRealEstate.integrationParams.integrationId,
                'integrationParams.integrationType':
                  areaButlerRealEstate.integrationParams.integrationType,
              }
            : {
                userId: areaButlerRealEstate.userId,
                externalSource: areaButlerRealEstate.externalSource,
                externalId: areaButlerRealEstate.externalId,
              };

        bulkOperations.push({
          updateOne: {
            filter: filterQuery,
            update: getProcUpdateQuery(areaButlerRealEstate),
            upsert: true,
          },
        });
      }

      await this.realEstateListingModel.bulkWrite(bulkOperations);
    }

    return errorIds;
  }

  async importFromOnOffice(
    user: UserDocument | TIntegrationUserDocument,
    estateStatusParams?: IApiOnOfficeSyncEstatesFilterParams,
  ): Promise<string[]> {
    const isIntegrationUser = 'integrationUserId' in user;
    const errorIds: string[] = [];
    const actionId = ApiOnOfficeActionIdsEnum.READ;
    const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
    const timestamp = dayjs().unix();
    const intUserParams = isIntegrationUser
      ? (user.parameters as IApiIntUserOnOfficeParams)
      : undefined;

    const resConnectSettings = isIntegrationUser
      ? { token: intUserParams.token, secret: intUserParams.apiKey }
      : user.apiConnections[ApiRealEstateExtSourcesEnum.ON_OFFICE];

    const { token, secret } = resConnectSettings || {};

    if (!token || !secret) {
      throw new HttpException('onOffice authentication failed!', 401);
    }

    let signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      secret,
      'base64',
    );

    const parameters: IApiOnOfficeReqActParams = {
      listlimit: ON_OFFICE_ESTATES_PER_PAGE,
      listoffset: 0,
      formatoutput: true,
      data: [
        'Id', // onOffice estate id
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
        'status2',
        'objektnr_extern', // external id
      ],
    };

    if (isIntegrationUser) {
      parameters.extendedclaim = intUserParams.extendedClaim;
    }

    if (estateStatusParams) {
      parameters.filter = {};

      Object.keys(estateStatusParams).forEach((key) => {
        const value =
          estateStatusParams[key as keyof IApiSyncEstatesIntFilterParams];

        if (value) {
          parameters.filter[key] = [
            {
              op: '=',
              val: value,
            },
          ];
        }
      });
    }

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            parameters,
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: '',
            identifier: '',
            resourcetype: resourceType,
          },
        ],
      },
    };

    const initialResponse = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.importFromCrm.name,
      'The onOffice import failed!',
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
      const numberOfPages = Math.ceil(totalCount / ON_OFFICE_ESTATES_PER_PAGE);

      for (let i = 2; i < numberOfPages + 1; i += 1) {
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
          'The onOffice import failed!',
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

    this.logger.log(
      `User ${
        isIntegrationUser
          ? `${user.integrationUserId} / ${user.integrationType}`
          : user.id
      } is going to import ${totalCount} real estates from onOffice split into ${
        chunks.length
      } chunks.`,
    );

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

        const processedUserEmail = (
          isIntegrationUser ? intUserParams.email : user.email
        )?.toLowerCase();

        if (
          !isIntegrationUser &&
          Object.values<string>(
            ApiOnOfficeRealEstStatusByUserEmailsEnum,
          ).includes(processedUserEmail)
        ) {
          setRealEstateStatusByUserEmail(processedUserEmail, realEstate);
        }

        // LEFT FOR DEBUGGING PURPOSES
        // testData.push(
        //   `${realEstate.Id}: ${
        //     realEstate.status2
        //   }, ${realEstate.vermarktungsart}, ${
        //     (realEstate as IApiOnOfficeProcessedRealEstate).areaButlerStatus
        //   }`,
        // );

        const estateData: Partial<IApiRealEstateListingSchema> = {
          address: locationAddress,
          location: {
            type: 'Point',
            coordinates: [
              place.geometry.location.lat,
              place.geometry.location.lng,
            ],
          } as GeoJsonPoint,
        };

        if (isIntegrationUser) {
          estateData.integrationParams = {
            integrationUserId: user.integrationUserId,
            integrationId: realEstate.Id,
            integrationType: user.integrationType,
          };
        }

        if (!isIntegrationUser) {
          estateData.userId = user.id;
          estateData.externalId = realEstate.Id;
          estateData.externalSource = ApiRealEstateExtSourcesEnum.ON_OFFICE;
        }

        Object.assign(realEstate, estateData);

        const areaButlerRealEstate = plainToInstance(
          ApiOnOfficeToAreaButlerDto,
          realEstate,
          { exposeUnsetFields: false },
        ) as IApiRealEstateListingSchema;

        await this.realEstateListingService.assignLocationIndices(
          areaButlerRealEstate,
        );

        const filterQuery: FilterQuery<IApiRealEstateListingSchema> =
          isIntegrationUser
            ? {
                'integrationParams.integrationUserId':
                  areaButlerRealEstate.integrationParams.integrationUserId,
                'integrationParams.integrationId':
                  areaButlerRealEstate.integrationParams.integrationId,
                'integrationParams.integrationType':
                  areaButlerRealEstate.integrationParams.integrationType,
              }
            : {
                userId: areaButlerRealEstate.userId,
                externalSource: areaButlerRealEstate.externalSource,
                externalId: areaButlerRealEstate.externalId,
              };

        bulkOperations.push({
          updateOne: {
            filter: filterQuery,
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

    return errorIds;
  }
}

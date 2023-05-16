import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';
import { createHmac } from 'crypto';
import { plainToInstance } from 'class-transformer';

import { configService } from '../config/config.service';
import { activateUserPath } from './shared/on-office.constants';
import { OnOfficeApiService } from '../client/on-office/on-office-api.service';
import { IntegrationUserService } from '../user/integration-user.service';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeResourceTypesEnum,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeActivationRes,
  IApiOnOfficeRequest,
  IApiOnOfficeLoginReq,
  IApiOnOfficeUnlockProviderReq,
  IApiOnOfficeLoginRes,
  IApiOnOfficeCreateOrderRes,
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeConfirmOrderQueryParams,
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeOrderData,
  IApiOnOfficeResponse,
  IApiOnOfficeActivationReq,
  IApiOnOfficeCreateOrderProduct,
  TApiOnOfficeConfirmOrderRes,
  IApiOnOfficeUpdateEstateReq,
  IApiOnOfficeUploadFileReq,
  IApiOnOfficeRealEstate,
} from '@area-butler-types/on-office';
import { allOnOfficeProducts } from '../../../shared/constants/on-office/products';
import {
  buildOnOfficeQueryString,
  getOnOfficeSortedMapData,
  parseCommaFloat,
} from '../../../shared/functions/shared.functions';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  OnOfficeTransaction,
  TOnOfficeTransactionDocument,
} from './schema/on-office-transaction.schema';
import { convertOnOfficeProdToIntUserProd } from './shared/on-office.functions';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import { GeoJsonPoint } from '../shared/geo-json.types';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { LocationIntegrationService } from '../location/location-integration.service';
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';
import { convertBase64ContentToUri } from '../../../shared/functions/image.functions';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import {
  IApiIntUserOnOfficeParams,
  TApiIntegrationUserConfig,
} from '@area-butler-types/integration-user';
import { openAiQueryTypeToOnOfficeEstateFieldMapping } from '../../../shared/constants/on-office/constants';
import ApiOnOfficeToAreaButlerDto from '../real-estate-listing/dto/api-on-office-to-area-butler.dto';

@Injectable()
export class OnOfficeService {
  private readonly apiUrl = configService.getBaseApiUrl();
  private readonly appUrl = configService.getBaseAppUrl();
  private readonly providerSecret = configService.getOnOfficeProviderSecret();
  private readonly integrationType = IntegrationTypesEnum.ON_OFFICE;
  private readonly logger = new Logger(OnOfficeService.name);

  constructor(
    @InjectModel(OnOfficeTransaction.name)
    private readonly onOfficeTransactionModel: Model<TOnOfficeTransactionDocument>,
    private readonly onOfficeApiService: OnOfficeApiService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly locationIntegrationService: LocationIntegrationService,
  ) {}

  async getRenderData({
    customerWebId,
    userId,
    parameterCacheId,
    apiClaim: extendedClaim,
    apiToken: token,
  }: IApiOnOfficeActivationReq): Promise<IApiOnOfficeActivationRes> {
    await this.integrationUserService.upsert(
      `${customerWebId}-${userId}`,
      this.integrationType,
      extendedClaim,
      { parameterCacheId, extendedClaim, token, customerWebId, userId },
    );

    const scripts = [{ script: `${this.apiUrl}/on-office/unlockProvider.js` }];

    return {
      providerData: JSON.stringify({
        token,
        parameterCacheId,
        extendedClaim,
        url: `${this.apiUrl}/api/on-office/${activateUserPath}`,
      }),
      scripts,
    };
  }

  async unlockProvider(
    {
      token,
      secret: apiKey,
      parameterCacheId,
      extendedClaim,
    }: IApiOnOfficeUnlockProviderReq,
    integrationUser: TIntegrationUserDocument,
  ): Promise<string> {
    await this.integrationUserService.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: integrationUser.id,
            integrationType: this.integrationType,
          },
          update: {
            accessToken: extendedClaim,
            'parameters.token': token,
            'parameters.apiKey': apiKey,
            'parameters.extendedClaim': extendedClaim,
            'parameters.parameterCacheId': parameterCacheId,
          },
        },
      },
      {
        updateMany: {
          filter: {
            _id: { $ne: integrationUser.id },
            integrationType: this.integrationType,
            'parameters.customerWebId':
              integrationUser.parameters.customerWebId,
          },
          update: {
            'parameters.token': token,
            'parameters.apiKey': apiKey,
          },
        },
      },
    ]);

    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UNLOCK_PROVIDER;
    const timestamp = dayjs().unix();

    const signature = this.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
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
              extendedclaim: extendedClaim,
              parameterCacheId: parameterCacheId,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    try {
      this.checkResponseIsSuccess(
        this.login.name,
        'User login failed!',
        request,
        response,
      );

      return 'active';
    } catch (e) {
      return 'error';
    }
  }

  async login({
    onOfficeQueryParams: {
      customerName,
      customerWebId,
      userId,
      estateId,
      parameterCacheId,
      apiClaim: extendedClaim,
    },
  }: IApiOnOfficeLoginReq): Promise<IApiOnOfficeLoginRes> {
    const integrationUserId = `${customerWebId}-${userId}`;

    // '$or' clause doesn't have a clear ordering so two 'find' requests are used
    // single onOffice account can have multiple users and if one of the users activates the app, it will be activated for the others
    let existingUser = await this.integrationUserService.findOne(
      { integrationUserId },
      this.integrationType,
    );

    let integrationUser;

    if (existingUser) {
      const { userName, email } = await this.fetchUserData({
        ...existingUser.parameters,
        extendedClaim,
      });

      const { color, logo } = await this.fetchLogoAndColor({
        ...existingUser.parameters,
        extendedClaim,
      });

      integrationUser = await this.integrationUserService.findByDbIdAndUpdate(
        existingUser.id,
        {
          accessToken: extendedClaim,
          'parameters.extendedClaim': extendedClaim,
          'parameters.parameterCacheId': parameterCacheId,
          'parameters.customerName': customerName,
          'parameters.userName': userName,
          'parameters.email': email,
          'config.color': color ? `#${color}` : undefined,
          'config.logo': logo ? convertBase64ContentToUri(logo) : undefined,
        },
      );
    }

    if (!existingUser) {
      existingUser = await this.integrationUserService.findOne(
        {
          'parameters.customerWebId': customerWebId,
          'parameters.token': { $exists: true },
          'parameters.apiKey': { $exists: true },
        },
        this.integrationType,
      );
    }

    if (!integrationUser && existingUser) {
      const { userName, email } = await this.fetchUserData({
        ...existingUser.parameters,
        extendedClaim,
      });

      const { color, logo } = await this.fetchLogoAndColor({
        ...existingUser.parameters,
        extendedClaim,
      });

      integrationUser = await this.integrationUserService.create({
        integrationUserId,
        integrationType: this.integrationType,
        accessToken: extendedClaim,
        parameters: {
          parameterCacheId,
          customerName,
          customerWebId,
          userId,
          userName,
          email,
          extendedClaim,
          apiKey: existingUser.parameters.apiKey,
          token: existingUser.parameters.token,
        },
        config: {
          color: color ? `#${color}` : undefined,
          logo: logo ? convertBase64ContentToUri(logo) : undefined,
        } as TApiIntegrationUserConfig,
      });
    }

    if (!integrationUser) {
      this.logger.error(this.login, integrationUserId, customerWebId);
      throw new HttpException('Die App muss neu aktiviert werden.', 400); // The app must be reactivated.
    }

    const availProdContingents =
      this.integrationUserService.getAvailProdContingents(integrationUser);

    const areaButlerEstate = await this.fetchAndProcessEstateData(
      estateId,
      integrationUser,
    );

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingIntService.upsertByIntegrationParams(
        areaButlerEstate,
      ),
    );

    const snapshot =
      await this.locationIntegrationService.fetchLatestSnapByIntId(
        estateId,
        integrationUser,
        this.integrationType,
      );

    return {
      availProdContingents,
      realEstate,
      integrationId: estateId,
      accessToken: extendedClaim,
      config: integrationUser.config,
      latestSnapshot: snapshot
        ? mapSnapshotToEmbeddableMap(snapshot)
        : undefined,
    };
  }

  async createOrder(
    { integrationId, products }: IApiOnOfficeCreateOrderReq,
    {
      accessToken,
      integrationUserId,
      parameters: { parameterCacheId },
    }: TIntegrationUserDocument,
  ): Promise<IApiOnOfficeCreateOrderRes> {
    await Promise.all(
      products.map(async (product) => {
        const { _id: id } = await new this.onOfficeTransactionModel({
          integrationUserId,
          product,
        }).save();

        product.transactionDbId = id;

        return product;
      }),
    );

    let totalPrice = 0;

    const processedProducts = products.map(({ type, quantity }) => {
      const { price } = allOnOfficeProducts[type];
      totalPrice += price * quantity;

      return {
        name: type,
        price: price.toFixed(2),
        quantity: `${quantity}`,
        circleofusers: 'customer',
      };
    });

    const onOfficeOrderData = {
      callbackurl: `${
        this.appUrl
      }/on-office/?accessToken=${accessToken}&integrationId=${integrationId}&products=${encodeURIComponent(
        JSON.stringify(products),
      )}`,
      parametercacheid: parameterCacheId,
      products: processedProducts,
      totalprice: totalPrice.toFixed(2),
      timestamp: dayjs().unix(),
    } as IApiOnOfficeOrderData;

    const sortedOrderData = getOnOfficeSortedMapData(onOfficeOrderData);
    const orderQueryString = buildOnOfficeQueryString(sortedOrderData);
    onOfficeOrderData.signature = this.generateSignature(orderQueryString);

    return { onOfficeOrderData };
  }

  async confirmOrder(
    confirmOrderData: IApiOnOfficeConfirmOrderReq,
  ): Promise<TApiOnOfficeConfirmOrderRes> {
    const {
      onOfficeQueryParams: {
        message,
        status,
        transactionid: transactionId,
        referenceid: referenceId,
        accessToken,
        integrationId,
        products,
      },
    } = confirmOrderData;

    // Integration user is fetched here on purpose to skip next steps on failure
    let integrationUser = await this.integrationUserService.findOneOrFail(
      { accessToken },
      this.integrationType,
    );

    const [product]: [IApiOnOfficeCreateOrderProduct] = JSON.parse(
      decodeURIComponent(products),
    );

    if (
      ![
        ApiOnOfficeTransactionStatusesEnum.INPROCESS,
        ApiOnOfficeTransactionStatusesEnum.SUCCESS,
      ].includes(status)
    ) {
      const parsedMessage = message
        ? decodeURIComponent(message.replace(/\+/g, ' '))
        : undefined;

      this.logger.debug(
        this.confirmOrder.name,
        parsedMessage,
        confirmOrderData,
      );

      await this.onOfficeTransactionModel.updateOne(
        { _id: product.transactionDbId },
        { message: parsedMessage },
      );

      return { message: parsedMessage };
    }

    await this.onOfficeTransactionModel.updateOne(
      { _id: product.transactionDbId },
      {
        transactionId: transactionId,
        referenceId: referenceId,
        status: status,
      },
    );

    integrationUser = await this.integrationUserService.addProductContingents(
      integrationUser.id,
      convertOnOfficeProdToIntUserProd(product),
    );

    const snapshot =
      await this.locationIntegrationService.fetchLatestSnapByIntId(
        integrationId,
        integrationUser,
        this.integrationType,
      );

    return {
      config: integrationUser.config,
      availProdContingents:
        await this.integrationUserService.getAvailProdContingents(
          integrationUser,
        ),
      realEstate: mapRealEstateListingToApiRealEstateListing(
        await this.realEstateListingIntService.findOneOrFailByIntParams({
          integrationId,
          integrationUserId: integrationUser.integrationUserId,
          integrationType: this.integrationType,
        }),
      ),
      integrationId,
      accessToken,
      latestSnapshot: snapshot
        ? mapSnapshotToEmbeddableMap(snapshot)
        : undefined,
    };
  }

  async updateEstate(
    { parameters: { token, apiKey, extendedClaim } }: TIntegrationUserDocument,
    integrationId: string,
    { queryType, queryResponse }: IApiOnOfficeUpdateEstateReq,
  ): Promise<void> {
    const actionId = ApiOnOfficeActionIdsEnum.MODIFY;
    const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
    const timestamp = dayjs().unix();

    const signature = this.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
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
            resourceid: integrationId,
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              extendedclaim: extendedClaim,
              data: {
                [openAiQueryTypeToOnOfficeEstateFieldMapping[queryType]]:
                  queryResponse.slice(0, 2000),
              },
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.checkResponseIsSuccess(
      this.updateEstate.name,
      'Estate update failed!',
      request,
      response,
    );
  }

  async uploadFile(
    { parameters: { token, apiKey, extendedClaim } }: TIntegrationUserDocument,
    {
      fileTitle,
      base64Content,
      artType,
      integrationId,
      filename,
    }: IApiOnOfficeUploadFileReq,
  ): Promise<void> {
    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UPLOAD_FILE;

    const timestamp = dayjs().unix();
    const signature = this.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const initialRequest: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: null,
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              extendedclaim: extendedClaim,
              data: base64Content,
            },
          },
        ],
      },
    };

    const initialResponse = await this.onOfficeApiService.sendRequest(
      initialRequest,
    );

    this.checkResponseIsSuccess(
      this.uploadFile.name,
      'File upload failed on the 1st step!',
      initialRequest,
      initialResponse,
    );

    const finalRequest: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: null,
            resourcetype: resourceType,
            identifier: '',
            parameters: {
              extendedclaim: extendedClaim,
              module: 'estate',
              tmpUploadId:
                initialResponse.response.results[0].data.records[0].elements
                  .tmpUploadId,
              file: filename,
              title: fileTitle,
              Art: artType,
              setDefaultPublicationRights: true,
              relatedRecordId: integrationId,
            },
          },
        ],
      },
    };

    const finalResponse = await this.onOfficeApiService.sendRequest(
      finalRequest,
    );

    this.checkResponseIsSuccess(
      this.uploadFile.name,
      'File upload failed on the 2nd step!',
      finalRequest,
      finalResponse,
    );
  }

  async uploadLink(
    { parameters: { token, apiKey, extendedClaim } }: TIntegrationUserDocument,
    { fileTitle, url, artType, integrationId }: IApiOnOfficeUploadFileReq,
  ): Promise<void> {
    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UPLOAD_FILE;

    const timestamp = dayjs().unix();
    const signature = this.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
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
            resourceid: null,
            resourcetype: resourceType,
            identifier: '',
            parameters: {
              url,
              extendedclaim: extendedClaim,
              module: 'estate',
              title: fileTitle,
              Art: artType,
              relatedRecordId: integrationId,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.checkResponseIsSuccess(
      this.uploadLink.name,
      'Link upload failed!',
      request,
      response,
    );
  }

  verifySignature(
    queryParams:
      | IApiOnOfficeLoginQueryParams
      | IApiOnOfficeConfirmOrderQueryParams,
    url: string,
  ): void {
    const { signature, ...otherParams } = queryParams;
    const sortedQueryParams = getOnOfficeSortedMapData(otherParams);

    // added "products" as a skipped key because it's already encoded
    const testQueryString = buildOnOfficeQueryString(sortedQueryParams, [
      'products',
      'message',
    ]);

    const testUrl = `${url}?${testQueryString}`;
    const generatedSignature = this.generateSignature(testUrl);

    if (generatedSignature === signature) {
      return;
    }

    this.logger.error(
      this.verifySignature.name,
      testUrl,
      generatedSignature,
      signature,
    );

    throw new HttpException('Request verification failed!', 400);
  }

  private generateSignature(
    data: string,
    secret = this.providerSecret,
    encoding: BufferEncoding = 'hex',
  ): string {
    return createHmac('sha256', secret)
      .update(data)
      .digest()
      .toString(encoding);
  }

  private async fetchAndProcessEstateData(
    estateId: string,
    {
      integrationUserId,
      parameters: { token, apiKey, extendedClaim },
    }: TIntegrationUserDocument,
  ): Promise<ApiOnOfficeToAreaButlerDto> {
    const actionId = ApiOnOfficeActionIdsEnum.READ;
    const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
    const timestamp = dayjs().unix();

    const signature = this.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
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
            resourceid: estateId,
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              data: [
                'objekttitel',
                'strasse',
                'hausnummer',
                'plz',
                'ort',
                'land',
                'breitengrad',
                'laengengrad',
                'anzahl_zimmer',
                'wohnflaeche', // nutzflaeche - realEstateSizeInSquareMeters
                'grundstuecksflaeche', // gesamtflaeche - propertySizeInSquareMeters
                'energyClass',
                'kaufpreis',
                'waehrung',
                'kaltmiete',
                'warmmiete',
                'anzahl_balkone',
                'unterkellert',
                'vermarktungsart',
              ],
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response: IApiOnOfficeResponse<IApiOnOfficeRealEstate> =
      await this.onOfficeApiService.sendRequest(request);

    this.checkResponseIsSuccess(
      this.fetchAndProcessEstateData.name,
      'The estate entity has not been retrieved!',
      request,
      response,
    );

    const onOfficeEstate =
      response.response.results[0].data.records[0].elements;

    const {
      breitengrad: lat,
      laengengrad: lng,
      strasse: street,
      hausnummer: houseNumber,
      plz: zipCode,
      ort: city,
      land: country,
    } = onOfficeEstate;

    const locationAddress = `${street} ${houseNumber}, ${zipCode} ${city}, ${country}`;

    const locationCoordinates = {
      lat: parseCommaFloat(lat),
      lng: parseCommaFloat(lng),
    };

    let place = await this.googleGeocodeService.fetchPlace(locationAddress);

    if (!place) {
      place = await this.googleGeocodeService.fetchPlace(locationCoordinates);
    }

    if (!place) {
      this.logger.error(
        this.fetchAndProcessEstateData.name,
        locationAddress,
        locationCoordinates,
      );

      throw new HttpException('Adresse nicht gefunden!', 400); // Address is not found
    }

    Object.assign(onOfficeEstate, {
      integrationParams: {
        integrationUserId,
        integrationId: estateId,
        integrationType: this.integrationType,
      },
      address: place.formatted_address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      } as GeoJsonPoint,
    });

    return plainToInstance(ApiOnOfficeToAreaButlerDto, onOfficeEstate, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }

  private async fetchLogoAndColor({
    token,
    apiKey,
    extendedClaim,
  }: IApiIntUserOnOfficeParams): Promise<{ color: string; logo: string }> {
    const actionId = ApiOnOfficeActionIdsEnum.READ;
    const resourceType = ApiOnOfficeResourceTypesEnum.BASIC_SETTINGS;
    const timestamp = dayjs().unix();

    const signature = this.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
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
              data: {
                basicData: {
                  characteristicsCi: [
                    'color',
                    // 'color2',
                    'logo',
                  ],
                },
              },
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.checkResponseIsSuccess(
      this.fetchLogoAndColor.name,
      "User color and logo haven't been retrieved!",
      request,
      response,
    );

    return response.response.results[0].data.records[0].elements.basicData
      .characteristicsCi;
  }

  private async fetchUserData({
    token,
    apiKey,
    extendedClaim,
    userId,
  }: IApiIntUserOnOfficeParams): Promise<{ userName: string; email: string }> {
    const actionId = ApiOnOfficeActionIdsEnum.READ;
    const resourceType = ApiOnOfficeResourceTypesEnum.USER;
    const timestamp = dayjs().unix();

    const signature = this.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
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
            resourceid: userId,
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              data: ['Name', 'email'],
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.checkResponseIsSuccess(
      this.fetchUserData.name,
      "User data hasn't been retrieved!",
      request,
      response,
    );

    const { Name: userName, email } =
      response.response.results[0].data.records[0].elements;

    return { userName, email };
  }

  private checkResponseIsSuccess(
    methodName: string,
    errorMessage: string,
    request: IApiOnOfficeRequest,
    response: IApiOnOfficeResponse,
  ): void {
    const {
      status: {
        code: responseCode,
        errorcode: responseErrorCode,
        message: responseMessage,
      },
      response: {
        results: [
          {
            status: { errorcode: actionErrorCode, message: actionMessage },
          },
        ],
      },
    } = response;

    const responseIsSuccess =
      responseCode === 200 &&
      responseErrorCode === 0 &&
      responseMessage === 'OK' &&
      actionErrorCode === 0 &&
      actionMessage === 'OK';

    if (!responseIsSuccess) {
      this.logger.error(methodName, request, response);
      throw new HttpException(errorMessage, 400);
    }
  }
}

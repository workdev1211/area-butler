import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';
import { plainToInstance } from 'class-transformer';

import { configService } from '../config/config.service';
import { activateUserPath } from './shared/on-office.constants';
import { OnOfficeApiService } from '../client/on-office/on-office-api.service';
import { IntegrationUserService } from '../user/integration-user.service';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeArtTypesEnum,
  ApiOnOfficeResourceTypesEnum,
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeActivationReq,
  IApiOnOfficeActivationRes,
  IApiOnOfficeConfirmOrderQueryParams,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeCreateOrderRes,
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeLoginReq,
  IApiOnOfficeLoginRes,
  IApiOnOfficeOrderData,
  IApiOnOfficeRealEstate,
  IApiOnOfficeRequest,
  IApiOnOfficeResponse,
  IApiOnOfficeUnlockProviderReq,
  IApiOnOfficeUpdEstTextFieldReq,
  IApiOnOfficeUplEstFileOrLinkReq,
  TApiOnOfficeConfirmOrderRes,
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
import { LocationIntService } from '../location/location-int.service';
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';
import { convertBase64ContentToUri } from '../../../shared/functions/image.functions';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import {
  AreaButlerExportTypesEnum,
  IApiIntUserOnOfficeParams,
  IIntUserExpMatchParams,
  TApiIntegrationUserConfig,
} from '@area-butler-types/integration-user';
import { openAiQueryTypeToOnOfficeEstateFieldMapping } from '../../../shared/constants/on-office/constants';
import ApiOnOfficeToAreaButlerDto from '../real-estate-listing/dto/api-on-office-to-area-butler.dto';

@Injectable()
export class OnOfficeService {
  private readonly apiUrl = configService.getBaseApiUrl();
  private readonly appUrl = configService.getBaseAppUrl();
  private readonly integrationType = IntegrationTypesEnum.ON_OFFICE;
  private readonly logger = new Logger(OnOfficeService.name);

  constructor(
    @InjectModel(OnOfficeTransaction.name)
    private readonly onOfficeTransactionModel: Model<TOnOfficeTransactionDocument>,
    private readonly onOfficeApiService: OnOfficeApiService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly locationIntService: LocationIntService,
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

    const signature = this.onOfficeApiService.generateSignature(
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
      this.onOfficeApiService.checkResponseIsSuccess(
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

    const snapshot = await this.locationIntService.fetchLatestSnapByIntId(
      integrationUser,
      estateId,
      this.integrationType,
    );

    return {
      integrationUserId,
      availProdContingents,
      realEstate,
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
    onOfficeOrderData.signature =
      this.onOfficeApiService.generateSignature(orderQueryString);

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

    const snapshot = await this.locationIntService.fetchLatestSnapByIntId(
      integrationUser,
      integrationId,
      this.integrationType,
    );

    return {
      integrationUserId: integrationUser.integrationUserId,
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
      accessToken,
      latestSnapshot: snapshot
        ? mapSnapshotToEmbeddableMap(snapshot)
        : undefined,
    };
  }

  async updateEstateTextField(
    {
      parameters: { token, apiKey, extendedClaim },
      config: { exportMatching },
    }: TIntegrationUserDocument,
    integrationId: string,
    { exportType, text }: IApiOnOfficeUpdEstTextFieldReq,
  ): Promise<void> {
    const actionId = ApiOnOfficeActionIdsEnum.MODIFY;
    const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
    const timestamp = dayjs().unix();

    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const defaultMaxTextLength = 2000;

    const exportMatchingParams: IIntUserExpMatchParams =
      exportMatching && exportMatching[exportType]
        ? exportMatching[exportType]
        : {
            fieldId: openAiQueryTypeToOnOfficeEstateFieldMapping[exportType],
            maxTextLength: defaultMaxTextLength,
          };

    const processedText =
      exportMatchingParams.maxTextLength === 0
        ? text
        : text.slice(
            0,
            exportMatchingParams.maxTextLength || defaultMaxTextLength,
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
                [exportMatchingParams.fieldId]: processedText,
              },
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.updateEstateTextField.name,
      'Estate update failed!',
      request,
      response,
    );
  }

  async uploadEstateFile(
    {
      parameters: { token, apiKey, extendedClaim },
      config: { exportMatching },
    }: TIntegrationUserDocument,
    integrationId: string,
    {
      exportType,
      fileTitle,
      base64Content,
      filename,
    }: IApiOnOfficeUplEstFileOrLinkReq,
  ): Promise<void> {
    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UPLOAD_FILE;

    const timestamp = dayjs().unix();
    const signature = this.onOfficeApiService.generateSignature(
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

    this.onOfficeApiService.checkResponseIsSuccess(
      this.uploadEstateFile.name,
      'File upload failed on the 1st step!',
      initialRequest,
      initialResponse,
    );

    let artType = ApiOnOfficeArtTypesEnum.FOTO;

    if (exportType === AreaButlerExportTypesEnum.QR_CODE) {
      artType = ApiOnOfficeArtTypesEnum['QR-CODE'];
    }
    if (exportType === AreaButlerExportTypesEnum.SCREENSHOT) {
      artType = ApiOnOfficeArtTypesEnum.LAGEPLAN;
    }

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

    if (exportMatching && exportMatching[exportType]) {
      finalRequest.request.actions[0].parameters.documentAttribute =
        exportMatching[exportType].fieldId;
    }

    const finalResponse = await this.onOfficeApiService.sendRequest(
      finalRequest,
    );

    this.onOfficeApiService.checkResponseIsSuccess(
      this.uploadEstateFile.name,
      'File upload failed on the 2nd step!',
      finalRequest,
      finalResponse,
    );
  }

  async uploadEstateLink(
    {
      parameters: { token, apiKey, extendedClaim },
      config: { exportMatching },
    }: TIntegrationUserDocument,
    integrationId: string,
    { fileTitle, url, exportType }: IApiOnOfficeUplEstFileOrLinkReq,
  ): Promise<void> {
    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UPLOAD_FILE;

    const timestamp = dayjs().unix();
    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const artType = ApiOnOfficeArtTypesEnum.LINK;

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

    // should be verified or removed in the future
    // if (exportMatching && exportMatching[exportType]) {
    //   request.request.actions[0].parameters.documentAttribute =
    //     exportMatching[exportType].fieldId;
    // }

    const response = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.uploadEstateLink.name,
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
    const generatedSignature =
      this.onOfficeApiService.generateSignature(testUrl);

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

    const signature = this.onOfficeApiService.generateSignature(
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
              ],
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response: IApiOnOfficeResponse<IApiOnOfficeRealEstate> =
      await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
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

    const signature = this.onOfficeApiService.generateSignature(
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

    this.onOfficeApiService.checkResponseIsSuccess(
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

    const signature = this.onOfficeApiService.generateSignature(
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

    this.onOfficeApiService.checkResponseIsSuccess(
      this.fetchUserData.name,
      "User data hasn't been retrieved!",
      request,
      response,
    );

    const { Name: userName, email } =
      response.response.results[0].data.records[0].elements;

    return { userName, email };
  }
}

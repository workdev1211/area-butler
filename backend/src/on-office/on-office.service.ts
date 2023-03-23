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
} from '@area-butler-types/on-office';
import { allOnOfficeProducts } from '../../../shared/constants/on-office/products';
import {
  buildOnOfficeQueryString,
  getOnOfficeSortedMapData,
} from '../../../shared/functions/shared.functions';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  OnOfficeTransaction,
  TOnOfficeTransactionDocument,
} from './schema/on-office-transaction.schema';
import { convertOnOfficeProdToIntUserProd } from './shared/on-office.functions';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import OnOfficeEstateToAreaButlerEstateDto from './dto/on-office-estate-to-areabutler-estate.dto';
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
    integrationUserId,
    token,
    parameterCacheId,
    extendedClaim,
  }: IApiOnOfficeActivationReq): Promise<IApiOnOfficeActivationRes> {
    await this.integrationUserService.upsert(
      integrationUserId,
      this.integrationType,
      extendedClaim,
      { extendedClaim },
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
    await this.integrationUserService.updateParamsAndConfig(
      integrationUser,
      extendedClaim,
      {
        token,
        apiKey,
        extendedClaim,
      },
    );

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
              parameterCacheId: parameterCacheId,
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    return this.checkOnOfficeResponseSuccess(response) ? 'active' : 'error';
  }

  async login({
    onOfficeQueryParams: {
      userId: integrationUserId,
      apiClaim: extendedClaim,
      estateId,
      parameterCacheId,
    },
  }: IApiOnOfficeLoginReq): Promise<IApiOnOfficeLoginRes> {
    let integrationUser = await this.integrationUserService.findOneOrFail(
      { integrationUserId },
      this.integrationType,
    );

    // Could be a race condition with the extendedClaims
    const { color, logo } = await this.fetchLogoAndColor({
      ...integrationUser.parameters,
      extendedClaim,
    });

    integrationUser = await this.integrationUserService.updateParamsAndConfig(
      integrationUser,
      extendedClaim,
      {
        extendedClaim,
        parameterCacheId,
      },
      {
        color: color ? `#${color}` : undefined,
        logo: logo ? convertBase64ContentToUri(logo) : undefined,
      } as TApiIntegrationUserConfig,
    );

    const availProdContingents =
      this.integrationUserService.getAvailProdContingents(integrationUser);

    const areaButlerEstate = await this.fetchAndProcessEstateData(
      estateId,
      integrationUser,
    );

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      await this.realEstateListingIntService.upsertByIntegrationParams(
        {
          integrationId: estateId,
          integrationUserId,
          integrationType: this.integrationType,
        },
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

    const integrationUser = await this.integrationUserService.findOneOrFail(
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

    await this.integrationUserService.addProductContingent(
      integrationUser,
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

  async fetchAndProcessEstateData(
    estateId: string,
    {
      integrationUserId,
      parameters: { token, apiKey, extendedClaim },
    }: TIntegrationUserDocument,
  ): Promise<OnOfficeEstateToAreaButlerEstateDto> {
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
              ],
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    if (!this.checkOnOfficeResponseSuccess(response)) {
      this.logger.error(this.fetchAndProcessEstateData.name, request, response);
      throw new HttpException('The estate entity has not been retrieved!', 400);
    }

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

    const location =
      +lat && +lng
        ? {
            lat: +lat,
            lng: +lng,
          }
        : `${street} ${houseNumber}, ${zipCode} ${city}, ${country}`;

    const place = await this.googleGeocodeService.fetchPlace(location);

    if (!place) {
      this.logger.error(this.fetchAndProcessEstateData.name, location, place);
      throw new HttpException('Place has not been found!', 400);
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

    return plainToInstance(
      OnOfficeEstateToAreaButlerEstateDto,
      onOfficeEstate,
      { excludeExtraneousValues: true, exposeUnsetFields: false },
    );
  }

  generateSignature(
    data: string,
    secret = this.providerSecret,
    encoding: BufferEncoding = 'hex',
  ): string {
    return createHmac('sha256', secret)
      .update(data)
      .digest()
      .toString(encoding);
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
              data: {
                [openAiQueryTypeToOnOfficeEstateFieldMapping[queryType]]:
                  queryResponse.slice(0, 2000),
              },
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    if (!this.checkOnOfficeResponseSuccess(response)) {
      this.logger.error(this.updateEstate.name, request, response);
      throw new HttpException('Estate update failed!', 400);
    }
  }

  private checkOnOfficeResponseSuccess<T>({
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
  }: IApiOnOfficeResponse<T>): boolean {
    return (
      responseCode === 200 &&
      responseErrorCode === 0 &&
      responseMessage === 'OK' &&
      actionErrorCode === 0 &&
      actionMessage === 'OK'
    );
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

    if (!this.checkOnOfficeResponseSuccess(response)) {
      this.logger.error(this.fetchLogoAndColor.name, request, response);

      throw new HttpException(
        "User color and logo haven't been retrieved!",
        400,
      );
    }

    return response.response.results[0].data.records[0].elements.basicData
      .characteristicsCi;
  }
}

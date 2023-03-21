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
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
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
  IApiOnOfficeConfirmOrderRes,
  IApiOnOfficeOrderData,
  IApiOnOfficeResponse,
  IApiOnOfficeActivationReq,
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
    const integrationUser = await this.integrationUserService.findOneOrFail(
      { integrationUserId },
      this.integrationType,
    );

    const { color, logo } = await this.getColorAndLogo(integrationUser);

    const { config } = await this.integrationUserService.updateParamsAndConfig(
      integrationUser,
      extendedClaim,
      {
        extendedClaim,
        parameterCacheId,
      },
      {
        color: color ? `#${color}` : undefined,
        logo: logo ? convertBase64ContentToUri(logo) : undefined,
      },
    );

    const availProdContingents =
      this.integrationUserService.getAvailProdContingents(integrationUser);

    const areaButlerEstate = await this.getEstateData(
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

    this.logger.debug(this.login.name, areaButlerEstate);

    return {
      config,
      availProdContingents,
      realEstate,
      integrationId: estateId,
      accessToken: extendedClaim,
    };
  }

  async createOrder(
    { products }: IApiOnOfficeCreateOrderReq,
    {
      integrationUserId,
      parameters: { parameterCacheId },
    }: TIntegrationUserDocument,
  ): Promise<IApiOnOfficeCreateOrderRes> {
    const savedProducts = await Promise.all(
      products.map(async (product) => {
        const { _id: id } = await new this.onOfficeTransactionModel({
          integrationUserId,
          product,
        }).save();

        product.id = id;

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
      callbackurl: `${this.appUrl}/on-office/confirm-order`,
      parametercacheid: parameterCacheId,
      products: processedProducts,
      totalprice: totalPrice.toFixed(2),
      timestamp: dayjs().unix(),
    } as IApiOnOfficeOrderData;

    const sortedOrderData = getOnOfficeSortedMapData(onOfficeOrderData);
    const orderQueryString = buildOnOfficeQueryString(sortedOrderData);
    onOfficeOrderData.signature = this.generateSignature(orderQueryString);

    return { onOfficeOrderData, products: savedProducts };
  }

  async confirmOrder(
    confirmOrderData: IApiOnOfficeConfirmOrderReq,
    integrationUser: TIntegrationUserDocument,
  ): Promise<IApiOnOfficeConfirmOrderRes> {
    const { product, onOfficeQueryParams } = confirmOrderData;

    this.logger.debug(this.confirmOrder.name, product, onOfficeQueryParams);

    switch (onOfficeQueryParams.status) {
      case ApiOnOfficeTransactionStatusesEnum.INPROCESS:
      case ApiOnOfficeTransactionStatusesEnum.SUCCESS: {
        this.logger.debug(1, JSON.parse(JSON.stringify(integrationUser)));

        await this.onOfficeTransactionModel.updateOne(
          { _id: product.id },
          {
            transactionId: onOfficeQueryParams.transactionid,
            referenceId: onOfficeQueryParams.referenceid,
            status: onOfficeQueryParams.status,
          },
        );

        await this.integrationUserService.addProductContingent(
          integrationUser,
          convertOnOfficeProdToIntUserProd(product),
        );

        this.logger.debug(2, JSON.parse(JSON.stringify(integrationUser)));

        return {
          availProdContingents:
            await this.integrationUserService.getAvailProdContingents(
              integrationUser,
            ),
        };
      }

      case ApiOnOfficeTransactionStatusesEnum.ERROR:
      default: {
        await this.onOfficeTransactionModel.deleteOne({ _id: product.id });
        return { message: onOfficeQueryParams.message.replace(/\+/g, ' ') };
      }
    }
  }

  async getEstateData(
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

  async fetchLatestSnapshot(
    integrationId: string,
    integrationUser: TIntegrationUserDocument,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshot =
      await this.locationIntegrationService.fetchLatestSnapByIntId(
        integrationId,
        integrationUser,
        this.integrationType,
      );

    return snapshot ? mapSnapshotToEmbeddableMap(snapshot) : undefined;
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
    const testQueryString = buildOnOfficeQueryString(sortedQueryParams);
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

  private checkOnOfficeResponseSuccess<T>({
    status: { code, errorcode, message },
  }: IApiOnOfficeResponse<T>) {
    return code === 200 && errorcode === 0 && message === 'OK';
  }

  private async getColorAndLogo({
    parameters: { token, apiKey, extendedClaim },
  }: TIntegrationUserDocument): Promise<{ color: string; logo: string }> {
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
    this.logger.debug(this.getColorAndLogo.name, response);

    return response.response.results[0].data.records[0].elements.basicData
      .characteristicsCi;
  }
}

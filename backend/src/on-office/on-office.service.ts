import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';
import { createHmac } from 'crypto';

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
  IApiOnOfficeFindCreateSnapshotReq,
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
} from '@area-butler-types/on-office';
import { allOnOfficeProducts } from '../../../shared/constants/on-office/products';
import {
  buildOnOfficeQueryString,
  getOnOfficeSortedMapData,
} from '../../../shared/functions/shared.functions';
import { ApiSnapshotService } from '../location/api-snapshot.service';
import { UserService } from '../user/user.service';
import { LocationService } from '../location/location.service';
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { UserDocument } from '../user/schema/user.schema';
import {
  OnOfficeTransaction,
  TOnOfficeTransactionDocument,
} from './schema/on-office-transaction.schema';
import { convertOnOfficeProdToIntUserProd } from './shared/on-office.functions';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

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
    private readonly userService: UserService,
    private readonly apiSnapshotService: ApiSnapshotService,
    private readonly locationService: LocationService,
  ) {}

  // TODO add a type
  async getRenderData({
    integrationUserId,
    token,
    parameterCacheId,
    extendedClaim,
  }: {
    integrationUserId: string;
    token: string;
    parameterCacheId: string;
    extendedClaim: string;
  }): Promise<IApiOnOfficeActivationRes> {
    await this.integrationUserService.upsert(
      integrationUserId,
      this.integrationType,
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
    await this.integrationUserService.updateParams(integrationUser, {
      token,
      apiKey,
      extendedClaim,
    });

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

    return response?.status?.code === 200 &&
      response?.status?.errorcode === 0 &&
      response?.status?.message === 'OK'
      ? 'active'
      : 'error';
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

    await this.integrationUserService.updateParams(integrationUser, {
      extendedClaim,
      parameterCacheId,
    });

    const availableProductContingents =
      this.integrationUserService.getAvailableProductContingents(
        integrationUser,
      );

    const estateData = await this.getEstateData(estateId, integrationUser);
    // TODO save to DB as a real estate entity

    return {
      integrationUserId,
      extendedClaim,
      estateId,
      availableProductContingents,
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

  // TODO add a type
  async confirmOrder(
    confirmOrderData: IApiOnOfficeConfirmOrderReq,
    integrationUser: TIntegrationUserDocument,
  ): Promise<IApiOnOfficeConfirmOrderRes> {
    const { extendedClaim, product, onOfficeQueryParams } = confirmOrderData;

    this.logger.debug(
      this.confirmOrder.name,
      extendedClaim,
      product,
      onOfficeQueryParams,
    );

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
          availableProductContingents:
            await this.integrationUserService.getAvailableProductContingents(
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

  async findOrCreateSnapshot(
    { estateId }: IApiOnOfficeFindCreateSnapshotReq,
    integrationType: IntegrationTypesEnum,
  ): Promise<ApiSearchResultSnapshotResponse> {
    // TODO add extract address call from OnOffice
    const address = 'Schadowstraße 55, Düsseldorf';
    const extendedClaim = '21';

    // const { userId } = await this.integrationUserService.findOneOrFail(
    //   {},
    //   integrationType,
    // );
    //
    // const user = await this.userService.findByIdWithSubscription(userId);

    const user = {} as UserDocument;

    try {
      return mapSnapshotToEmbeddableMap(
        await this.locationService.fetchSnapshotByIntegrationId(estateId),
      );
    } catch {
      this.logger.log(
        this.findOrCreateSnapshot.name,
        `Snapshot with the integration id ${estateId} was not found.`,
      );
    }

    return this.apiSnapshotService.createSnapshot({
      user,
      location: address,
      integrationParams: {
        integrationType,
        integrationUserId: extendedClaim,
        integrationId: estateId,
      },
    });
  }

  async getEstateData(
    estateId: string,
    integrationUser: TIntegrationUserDocument,
  ) {
    const {
      parameters: { token, apiKey, extendedClaim },
    } = integrationUser;
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

    this.logger.debug(this.getEstateData.name, request);
    const a1 = await this.onOfficeApiService.sendRequest(request);
    this.logger.debug(this.getEstateData.name, a1);
    const a2 = 'halt';

    return a1;
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

  findIntUserByExtendedClaim(
    extendedClaim: string,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserService.findOneOrFail(
      { 'parameters.extendedClaim': extendedClaim },
      this.integrationType,
    );
  }
}

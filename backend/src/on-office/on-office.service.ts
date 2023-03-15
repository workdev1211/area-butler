import { HttpException, Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { createHmac } from 'crypto';

import { configService } from '../config/config.service';
import { activateUserPath } from '../shared/on-office.constants';
import { OnOfficeApiService } from '../client/on-office/on-office-api.service';
import { IntegrationUserService } from '../user/integration-user.service';
import {
  ApiSearchResultSnapshotResponse,
  IntegrationTypesEnum,
} from '@area-butler-types/types';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeResourceTypesEnum,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeFindCreateSnapshotReq,
  IApiOnOfficeActivationRes,
  IApiOnOfficeRequest,
  IApiOnOfficeLoginReq,
  IApiOnOfficeResponse,
  IApiOnOfficeUnlockProviderReq,
  IApiOnOfficeLoginRes,
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

@Injectable()
export class OnOfficeService {
  private readonly apiUrl = configService.getBaseApiUrl();
  private readonly appUrl = configService.getBaseAppUrl();
  private readonly providerSecret = configService.getOnOfficeProviderSecret();
  private readonly integrationType = IntegrationTypesEnum.ON_OFFICE;
  private readonly logger = new Logger(OnOfficeApiService.name);

  constructor(
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

  async unlockProvider({
    token,
    secret: apiKey,
    parameterCacheId,
    extendedClaim,
  }: IApiOnOfficeUnlockProviderReq): Promise<IApiOnOfficeResponse> {
    await this.integrationUserService.findOneAndUpdateParams(
      { 'parameters.extendedClaim': extendedClaim },
      this.integrationType,
      { token, apiKey, extendedClaim },
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

    return this.onOfficeApiService.sendRequest(request);
  }

  async login(
    requestParams: IApiOnOfficeLoginReq,
  ): Promise<IApiOnOfficeLoginRes> {
    const {
      userId: integrationUserId,
      apiClaim: extendedClaim,
      estateId,
    } = requestParams;

    // TODO return user products
    await this.integrationUserService.findOneAndUpdateParams(
      { integrationUserId },
      this.integrationType,
      { extendedClaim },
    );

    return { integrationUserId, extendedClaim, estateId };
  }

  async createOrder({
    parameterCacheId,
    products,
  }: IApiOnOfficeCreateOrderReq): Promise<any> {
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

    // TODO add a type
    const initialOrderData: any = {
      callbackurl: `${this.appUrl}/on-office/map`,
      parametercacheid: parameterCacheId,
      products: processedProducts,
      totalprice: totalPrice.toFixed(2),
      timestamp: dayjs().unix(),
    };

    const sortedOrderData = getOnOfficeSortedMapData(initialOrderData);
    const orderQueryString = buildOnOfficeQueryString(sortedOrderData);
    initialOrderData.signature = this.generateSignature(orderQueryString);

    return initialOrderData;
  }

  async confirmOrder(
    confirmOrderData: IApiOnOfficeConfirmOrderReq,
  ): Promise<any> {
    const { extendedClaim, ...otherData } = confirmOrderData;
    this.verifySignature(otherData);

    // TODO add products in the return
    // const {
    //   parameters: { apiKey },
    // } = await this.integrationUserService.findUser(
    //   integrationUserId,
    //   ApiUserIntegrationTypesEnum.ON_OFFICE,
    // );

    return;
  }

  async findOrCreateSnapshot(
    { estateId }: IApiOnOfficeFindCreateSnapshotReq,
    integrationType: IntegrationTypesEnum,
  ): Promise<ApiSearchResultSnapshotResponse> {
    // TODO add extract address call from OnOffice
    const address = 'Schadowstraße 55, Düsseldorf';
    const extendedClaim = '21';

    const { userId } = await this.integrationUserService.findOneOrFail(
      {},
      integrationType,
    );

    const user = await this.userService.findByIdWithSubscription(userId);

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
        integrationId: estateId,
      },
    });
  }

  async test(
    { estateId }: IApiOnOfficeFindCreateSnapshotReq,
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
                'strasse',
                'hausnummer',
                'plz',
                'ort',
                'land',
                'breitengrad',
                'laengengrad',
                'nutzflaeche',
                'gesamtflaeche',
                'energyClass',
                'kaufpreis',
                'kaltmiete',
                'warmmiete',
                'anzahl_zimmer',
                'anzahl_balkone',
                'unterkellert',
              ],
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    this.logger.debug(this.test.name, request);
    const a1 = await this.onOfficeApiService.sendRequest(request);
    this.logger.debug(this.test.name, a1);
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
    requestParams: IApiOnOfficeLoginReq | IApiOnOfficeConfirmOrderReq,
  ): void {
    const { url: initialUrl, signature, ...queryParams } = requestParams;
    const sortedQueryParams = getOnOfficeSortedMapData(queryParams);
    const testQueryString = buildOnOfficeQueryString(sortedQueryParams);
    const testUrl = `${initialUrl}?${testQueryString}`;
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
}

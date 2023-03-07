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
  IApiOnOfficeConfirmOrder,
  IApiOnOfficeCreateOrder,
  IApiOnOfficeRenderData,
  IApiOnOfficeRequest,
  IApiOnOfficeRequestParams,
  IApiOnOfficeUnlockProvider,
} from '@area-butler-types/on-office';
import { allOnOfficeProducts } from '../../../shared/constants/on-office/products';
import {
  buildOnOfficeQueryString,
  getOnOfficeSortedMapData,
} from '../../../shared/functions/shared.functions';
import { ApiSnapshotService } from '../location/api-snapshot.service';
import { UserService } from '../user/user.service';
import { LocationService } from '../location/location.service';

@Injectable()
export class OnOfficeService {
  private readonly apiUrl = configService.getBaseApiUrl();
  private readonly appUrl = configService.getBaseAppUrl();
  private readonly providerSecret = configService.getOnOfficeProviderSecret();
  private readonly logger = new Logger(OnOfficeApiService.name);

  constructor(
    private readonly onOfficeApiService: OnOfficeApiService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly userService: UserService,
    private readonly apiSnapshotService: ApiSnapshotService,
    private readonly locationService: LocationService,
  ) {}

  async getRenderData({
    userId,
    token,
    parameterCacheId,
    extendedClaim,
  }: {
    userId: string;
    token: string;
    parameterCacheId: string;
    extendedClaim: string;
  }): Promise<IApiOnOfficeRenderData> {
    await this.integrationUserService.upsertUser(
      userId,
      IntegrationTypesEnum.ON_OFFICE,
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
  }: IApiOnOfficeUnlockProvider): Promise<any> {
    await this.integrationUserService.findUserAndUpdateParameters(
      {
        integrationType: IntegrationTypesEnum.ON_OFFICE,
        'parameters.extendedClaim': extendedClaim,
      },
      { token, apiKey, extendedClaim },
    );

    const actionId = 'urn:onoffice-de-ns:smart:2.5:smartml:action:do';
    const resourceType = 'unlockProvider';
    const timestamp = dayjs().unix();

    const hmac = createHmac('sha256', apiKey)
      .update([timestamp, token, resourceType, actionId].join(''))
      .digest()
      .toString('base64');

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac,
            hmac_version: 2,
            actionid: actionId,
            resourceid: '',
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

  generateSignature(data: string): string {
    return createHmac('sha256', this.providerSecret)
      .update(data)
      .digest()
      .toString('hex');
  }

  verifySignature(
    requestParams: IApiOnOfficeRequestParams | IApiOnOfficeConfirmOrder,
  ): void {
    const { url: initialUrl, signature, ...queryParams } = requestParams;

    const processedQueryParams = Object.keys(queryParams)
      .sort()
      .map<string[]>((key) => [key, queryParams[key] as string]);

    const resultingUrl = `${initialUrl}?${new URLSearchParams(
      processedQueryParams,
    )}`;

    if (this.generateSignature(resultingUrl) !== signature) {
      throw new HttpException('Request verification failed!', 400);
    }
  }

  async login(requestParams: IApiOnOfficeRequestParams): Promise<any> {
    this.verifySignature(requestParams);
    const { userId } = requestParams;

    // TODO add user products
    const { integrationUserId } = await this.integrationUserService.findUser(
      userId,
      IntegrationTypesEnum.ON_OFFICE,
    );

    return { integrationUserId };
  }

  async createOrder({
    userId,
    parameterCacheId,
    products,
  }: IApiOnOfficeCreateOrder): Promise<any> {
    // const {
    //   parameters: { apiKey },
    // } = await this.integrationUserService.findUser(
    //   userId,
    //   ApiUserIntegrationTypesEnum.ON_OFFICE,
    // );

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

    // TODO add type
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

  async confirmOrder(confirmOrderData: IApiOnOfficeConfirmOrder): Promise<any> {
    const { userId, ...otherData } = confirmOrderData;
    this.verifySignature(otherData);

    // TODO add products return
    // const {
    //   parameters: { apiKey },
    // } = await this.integrationUserService.findUser(
    //   userId,
    //   ApiUserIntegrationTypesEnum.ON_OFFICE,
    // );

    return;
  }

  async findOrCreateSnapshot(
    findOrCreateData: any,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const { userId } = await this.integrationUserService.findUser(
      '21',
      IntegrationTypesEnum.ON_OFFICE,
    );

    const user = await this.userService.findByIdWithSubscription(userId);

    try {
      // use mapSnapshotToEmbeddableMap method instead of as
      const existingSnapshot =
        (await this.locationService.fetchSnapshotByIntegrationId(
          findOrCreateData.integrationId,
        )) as ApiSearchResultSnapshotResponse;

      existingSnapshot.mapboxAccessToken = user.mapboxAccessToken;

      return existingSnapshot;
    } catch {}

    return this.apiSnapshotService.createSnapshot({
      user,
      location: findOrCreateData.address,
      integrationParams: {
        integrationId: findOrCreateData.integrationId,
        integrationType: IntegrationTypesEnum.ON_OFFICE,
      },
    });
  }
}

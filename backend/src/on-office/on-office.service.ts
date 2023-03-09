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
  IApiOnOfficeFindCreateSnapshot,
  IApiOnOfficeRenderData,
  IApiOnOfficeRequest,
  IApiOnOfficeRequestParams,
  IApiOnOfficeResponse,
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
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';

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

  // TODO add a type
  async getRenderData({
    integrationUserId,
    integrationType,
    token,
    parameterCacheId,
    extendedClaim,
  }: {
    integrationUserId: string;
    integrationType: IntegrationTypesEnum;
    token: string;
    parameterCacheId: string;
    extendedClaim: string;
  }): Promise<IApiOnOfficeRenderData> {
    await this.integrationUserService.upsert(
      integrationUserId,
      integrationType,
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
    }: IApiOnOfficeUnlockProvider,
    integrationType: IntegrationTypesEnum,
  ): Promise<IApiOnOfficeResponse> {
    await this.integrationUserService.findOneAndUpdateParams(
      {
        integrationType,
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

  async login(
    requestParams: IApiOnOfficeRequestParams,
    integrationType: IntegrationTypesEnum,
  ): Promise<any> {
    this.verifySignature(requestParams);
    const { userId: integrationUserId } = requestParams;

    // TODO add user products
    await this.integrationUserService.findOneOrFail(
      integrationUserId,
      integrationType,
    );

    // TODO add a type
    return { integrationUserId };
  }

  async createOrder({
    parameterCacheId,
    products,
  }: IApiOnOfficeCreateOrder): Promise<any> {
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

  async confirmOrder(confirmOrderData: IApiOnOfficeConfirmOrder): Promise<any> {
    const { userId, ...otherData } = confirmOrderData;
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
    { integrationId, integrationUserId }: IApiOnOfficeFindCreateSnapshot,
    integrationType: IntegrationTypesEnum,
  ): Promise<ApiSearchResultSnapshotResponse> {
    // TODO add extract address call from OnOffice
    const address = 'Schadowstraße 55, Düsseldorf';

    const { userId } = await this.integrationUserService.findOneOrFail(
      integrationUserId,
      integrationType,
    );

    const user = await this.userService.findByIdWithSubscription(userId);

    try {
      return mapSnapshotToEmbeddableMap(
        await this.locationService.fetchSnapshotByIntegrationId(integrationId),
      );
    } catch {
      this.logger.log(
        `Snapshot with integration id ${integrationId} was not found.`,
      );
    }

    return this.apiSnapshotService.createSnapshot({
      user,
      location: address,
      integrationParams: {
        integrationId,
        integrationType,
      },
    });
  }
}

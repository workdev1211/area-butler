import {
  HttpException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import * as dayjs from 'dayjs';

import { configService } from '../../config/config.service';
import { activateUserPath } from '../shared/on-office.constants';
import { OnOfficeApiService } from '../../client/on-office/on-office-api.service';
import { IntegrationUserService } from '../../user/integration-user.service';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeResourceTypesEnum,
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeActivationReq,
  IApiOnOfficeActivationRes,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
  IApiOnOfficeCreateOrderRes,
  IApiOnOfficeLoginQueryParams,
  IApiOnOfficeOrderData,
  IApiOnOfficeRealEstate,
  IApiOnOfficeRequest,
  IApiOnOfficeUnlockProviderReq,
  TApiOnOfficeConfirmOrderRes,
  TOnOfficeLoginQueryParams,
} from '@area-butler-types/on-office';
import { allOnOfficeProducts } from '../../../../shared/constants/on-office/on-office-products';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import {
  OnOfficeTransaction,
  TOnOfficeTransactionDocument,
} from '../schema/on-office-transaction.schema';
import { convertOnOfficeProdToIntUserProd } from '../shared/on-office.functions';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import { RealEstateListingIntService } from '../../real-estate-listing/real-estate-listing-int.service';
import { convertBase64ContentToUri } from '../../../../shared/functions/image.functions';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import {
  IApiIntUserLoginRes,
  IApiIntUserOnOfficeParams,
} from '@area-butler-types/integration-user';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import {
  buildOnOfficeQueryString,
  getOnOfficeSortedMapData,
} from '../../shared/functions/on-office';
import { FetchSnapshotService } from '../../location/fetch-snapshot.service';
import { ContingentIntService } from '../../user/contingent-int.service';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';
import { CompanyService } from '../../company/company.service';
import { ConvertIntUserService } from '../../user/convert-int-user.service';
import { OnOfficeEstateService } from './on-office-estate.service';

interface IProcessEstateData {
  onOfficeEstate: IApiOnOfficeRealEstate;
  place: GeocodeResult;
  realEstate: ApiRealEstateListing;
}

export interface IPerformLoginData extends IProcessEstateData {
  integrationUser: TIntegrationUserDocument;
}

@Injectable()
export class OnOfficeService {
  private readonly apiUrl = configService.getBaseApiUrl();
  private readonly appUrl = configService.getBaseAppUrl();
  private readonly integrationType = IntegrationTypesEnum.ON_OFFICE;
  private readonly logger = new Logger(OnOfficeService.name);

  constructor(
    @InjectModel(OnOfficeTransaction.name)
    private readonly onOfficeTransactionModel: Model<TOnOfficeTransactionDocument>,
    private readonly companyService: CompanyService,
    private readonly contingentIntService: ContingentIntService,
    private readonly convertIntUserService: ConvertIntUserService,
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly onOfficeApiService: OnOfficeApiService,
    private readonly onOfficeEstateService: OnOfficeEstateService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
  ) {}

  async activate(
    activationParams: IApiOnOfficeActivationReq,
  ): Promise<IApiOnOfficeActivationRes> {
    const {
      customerWebId,
      userId,
      parameterCacheId,
      apiClaim: extendedClaim,
      apiToken: token,
    } = activationParams;

    const integrationUserId = `${customerWebId}-${userId}`;

    const parameters = {
      parameterCacheId,
      extendedClaim,
      token,
      customerWebId,
      userId,
    };

    const integrationUser = await this.integrationUserService.findOneAndUpdate(
      this.integrationType,
      { integrationUserId },
      {
        parameters,
        accessToken: extendedClaim,
      },
    );

    if (!integrationUser) {
      const parentUser = await this.integrationUserService.findOne(
        this.integrationType,
        {
          'parameters.customerWebId': customerWebId,
          'parameters.token': { $exists: true },
          'parameters.apiKey': { $exists: true },
          isParent: true,
        },
        {
          _id: 1,
          companyId: 1,
        },
      );

      let companyId = parentUser?.companyId;

      if (!parentUser) {
        ({ id: companyId } = await this.companyService.upsert(
          {
            [`integrationParams.${this.integrationType}.customerWebId`]:
              customerWebId,
          },
          {
            [`integrationParams.${this.integrationType}`]: {
              [this.integrationType]: { customerWebId },
            },
          },
        ));
      }

      if (!companyId) {
        this.logger.debug(this.activate.name, activationParams, parentUser);

        throw new UnprocessableEntityException(
          'The onOffice user is corrupted!',
        );
      }

      await this.integrationUserService.create({
        companyId,
        integrationUserId,
        parameters,
        accessToken: extendedClaim,
        integrationType: this.integrationType,
        isContingentProvided: true,
        parentId: parentUser?.id,
      });
    }

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
            'parameters.customerWebId': (
              integrationUser.parameters as IApiIntUserOnOfficeParams
            ).customerWebId,
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

    const signature = OnOfficeApiService.generateSignature(
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
      OnOfficeApiService.checkResponseIsSuccess(
        this.unlockProvider.name,
        'User login failed!',
        request,
        response,
      );

      return 'active';
    } catch (e) {
      return 'error';
    }
  }

  async login(
    onOfficeQueryParams: IApiOnOfficeLoginQueryParams,
  ): Promise<IApiIntUserLoginRes> {
    const { integrationUser, realEstate } = await this.performLogin(
      onOfficeQueryParams,
    );

    return {
      realEstate,
      integrationUser: await this.convertIntUserService.convertDocToApiIntUser(
        integrationUser,
      ),
      latestSnapshot: await this.fetchSnapshotService.fetchLastSnapshotByIntId(
        integrationUser,
        realEstate.id,
      ),
    };
  }

  async createOrder(
    { integrationId, products }: IApiOnOfficeCreateOrderReq,
    {
      accessToken,
      integrationUserId,
      parentId,
      parameters,
    }: TIntegrationUserDocument,
  ): Promise<IApiOnOfficeCreateOrderRes> {
    if (parentId) {
      return;
    }

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
      parametercacheid: (parameters as IApiIntUserOnOfficeParams)
        .parameterCacheId,
      products: processedProducts,
      totalprice: totalPrice.toFixed(2),
      timestamp: dayjs().unix(),
    } as IApiOnOfficeOrderData;

    const sortedOrderData = getOnOfficeSortedMapData(onOfficeOrderData);
    const orderQueryString = buildOnOfficeQueryString(sortedOrderData);
    onOfficeOrderData.signature =
      OnOfficeApiService.generateSignature(orderQueryString);

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
      this.integrationType,
      { accessToken },
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

      await this.onOfficeTransactionModel.updateOne(
        { _id: product.transactionDbId },
        { transactionId, referenceId, status, message: parsedMessage },
      );

      return { message: parsedMessage };
    }

    await this.onOfficeTransactionModel.updateOne(
      { _id: product.transactionDbId },
      { transactionId, referenceId, status },
    );

    integrationUser = await this.contingentIntService.addProductContingents(
      integrationUser.id,
      convertOnOfficeProdToIntUserProd(product),
    );

    const parentUser = integrationUser.parentId
      ? await this.integrationUserService.findByDbId(integrationUser.parentId)
      : undefined;

    if (parentUser) {
      integrationUser.parentUser = parentUser;
    }

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationUserId: integrationUser.integrationUserId,
        integrationType: this.integrationType,
      }),
    );

    return {
      realEstate,
      integrationUser: await this.convertIntUserService.convertDocToApiIntUser(
        integrationUser,
      ),
      latestSnapshot: await this.fetchSnapshotService.fetchLastSnapshotByIntId(
        integrationUser,
        realEstate.id,
      ),
    };
  }

  verifySignature(queryParams: TOnOfficeLoginQueryParams, url: string): void {
    const { signature, ...otherParams } = queryParams;
    const sortedQueryParams = getOnOfficeSortedMapData(otherParams);

    // added "products" as a skipped key because it's already encoded
    const testQueryString = buildOnOfficeQueryString(sortedQueryParams, [
      'products',
      'message',
    ]);

    const testUrl = `${url}?${testQueryString}`;
    const generatedSignature =
      OnOfficeApiService.generateSignature(testUrl);

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

  async performLogin({
    customerName,
    customerWebId,
    userId,
    estateId,
    parameterCacheId,
    apiClaim: extendedClaim,
  }: IApiOnOfficeLoginQueryParams): Promise<IPerformLoginData> {
    const integrationUserId = `${customerWebId}-${userId}`;

    // single onOffice account can have multiple users and if one of the users activates the app, it will be activated for the others
    let integrationUser = await this.integrationUserService.findOne(
      this.integrationType,
      { integrationUserId },
    );

    const parentUser =
      integrationUser?.parentUser ||
      (!integrationUser?.isParent
        ? await this.integrationUserService.findOne(this.integrationType, {
            'parameters.customerWebId': customerWebId,
            'parameters.token': { $exists: true },
            'parameters.apiKey': { $exists: true },
            isParent: true,
          })
        : undefined);

    if (integrationUser) {
      const { userName, email } = await this.fetchUserData({
        ...integrationUser.parameters,
        extendedClaim,
      });

      const { color, logo } = await this.fetchLogoAndColor({
        ...integrationUser.parameters,
        extendedClaim,
      });

      if (color || logo) {
        await this.companyService.updateOne(
          { _id: integrationUser.company._id },
          {
            $set: {
              accessToken: extendedClaim,
              'config.color': color
                ? `#${color}`
                : integrationUser.company.config?.color,
              'config.logo': logo
                ? convertBase64ContentToUri(logo)
                : integrationUser.company.config?.logo,
            },
          },
        );
      }

      const updateQuery: UpdateQuery<TIntegrationUserDocument> = {
        $set: {
          accessToken: extendedClaim,
          'parameters.extendedClaim': extendedClaim,
          'parameters.parameterCacheId': parameterCacheId,
          'parameters.customerName': customerName,
          'parameters.userName': userName,
          'parameters.email': email,
          parentId: parentUser?.id,
        },
      };

      integrationUser = await this.integrationUserService.findByDbIdAndUpdate(
        integrationUser.id,
        updateQuery,
      );
    }

    if (!integrationUser) {
      const groupUser =
        parentUser ||
        (await this.integrationUserService.findOne(
          this.integrationType,
          {
            'parameters.customerWebId': customerWebId,
            'parameters.token': { $exists: true },
            'parameters.apiKey': { $exists: true },
          },
          { companyId: 1, parameters: 1 },
        ));

      if (groupUser) {
        const groupUserParams =
          groupUser.parameters as IApiIntUserOnOfficeParams;

        const { userName, email } = await this.fetchUserData({
          ...groupUser.parameters,
          extendedClaim,
          userId,
        });

        const { color, logo } = await this.fetchLogoAndColor({
          ...groupUser.parameters,
          extendedClaim,
        });

        if (color || logo) {
          await this.companyService.updateOne(
            { _id: groupUser.company._id },
            {
              $set: {
                'config.color': color
                  ? `#${color}`
                  : groupUser.company.config?.color,
                'config.logo': logo
                  ? convertBase64ContentToUri(logo)
                  : groupUser.company.config?.logo,
              },
            },
          );
        }

        integrationUser = await this.integrationUserService.create({
          integrationUserId,
          accessToken: extendedClaim,
          companyId: groupUser.companyId,
          integrationType: this.integrationType,
          parameters: {
            parameterCacheId,
            customerName,
            customerWebId,
            userId,
            userName,
            email,
            extendedClaim,
            apiKey: groupUserParams.apiKey,
            token: groupUserParams.token,
          },
          parentId: parentUser?.id,
        });
      }
    }

    if (!integrationUser) {
      this.logger.debug(this.login, integrationUserId, customerWebId);
      throw new HttpException('Die App muss neu aktiviert werden.', 400); // The app must be reactivated.
    }

    if (!integrationUser.parentUser && parentUser) {
      integrationUser.parentUser = parentUser;
    }

    const processedEstateData =
      await this.onOfficeEstateService.processEstateData(
        integrationUser,
        estateId,
      );

    return {
      integrationUser,
      ...processedEstateData,
    };
  }

  private async fetchLogoAndColor({
    token,
    apiKey,
    extendedClaim,
  }: IApiIntUserOnOfficeParams): Promise<{ color: string; logo: string }> {
    const actionId = ApiOnOfficeActionIdsEnum.READ;
    const resourceType = ApiOnOfficeResourceTypesEnum.BASIC_SETTINGS;
    const timestamp = dayjs().unix();

    const signature = OnOfficeApiService.generateSignature(
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

    OnOfficeApiService.checkResponseIsSuccess(
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

    const signature = OnOfficeApiService.generateSignature(
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

    OnOfficeApiService.checkResponseIsSuccess(
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

import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
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
  IApiOnOfficeOrderData,
  IApiOnOfficeRealEstate,
  IApiOnOfficeRequest,
  IApiOnOfficeResponse,
  IApiOnOfficeUnlockProviderReq,
  TApiOnOfficeConfirmOrderRes,
} from '@area-butler-types/on-office';
import { allOnOfficeProducts } from '../../../shared/constants/on-office/products';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  OnOfficeTransaction,
  TOnOfficeTransactionDocument,
} from './schema/on-office-transaction.schema';
import { convertOnOfficeProdToIntUserProd } from './shared/on-office.functions';
import {
  IApiIntCreateEstateLinkReq,
  IApiIntUpdEstTextFieldReq,
  IApiIntUploadEstateFileReq,
  IApiRealEstAvailIntStatuses,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';
import { GeoJsonPoint } from '../shared/types/geo-json';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { LocationIntService } from '../location/location-int.service';
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';
import { convertBase64ContentToUri } from '../../../shared/functions/image.functions';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import {
  AreaButlerExportTypesEnum,
  IApiIntegrationUserSchema,
  IApiIntUserLoginRes,
  IApiIntUserOnOfficeParams,
} from '@area-butler-types/integration-user';
import { openAiQueryTypeToOnOfficeEstateFieldMapping } from '../../../shared/constants/on-office/constants';
import ApiOnOfficeToAreaButlerDto from '../real-estate-listing/dto/api-on-office-to-area-butler.dto';
import { checkIsParent } from '../../../shared/functions/integration.functions';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import {
  buildOnOfficeQueryString,
  getOnOfficeSortedMapData,
  parseOnOfficeFloat,
} from '../shared/functions/on-office';
import { PlaceService } from '../place/place.service';

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
    private readonly placeService: PlaceService,
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
        { _id: 1, 'config.color': 1, 'config.logo': 1, 'config.mapIcon': 1 },
      );

      await this.integrationUserService.create({
        integrationUserId,
        parameters,
        accessToken: extendedClaim,
        config: {
          color: parentUser?.config.color,
          logo: parentUser?.config.logo,
          mapIcon: parentUser?.config.mapIcon,
        },
        integrationType: this.integrationType,
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
  }: IApiOnOfficeLoginReq): Promise<IApiIntUserLoginRes> {
    const integrationUserId = `${customerWebId}-${userId}`;

    // single onOffice account can have multiple users and if one of the users activates the app, it will be activated for the others
    let integrationUser = await this.integrationUserService.findOne(
      this.integrationType,
      { integrationUserId },
    );

    const parentUser = !integrationUser?.isParent
      ? await this.integrationUserService.findOne(this.integrationType, {
          'parameters.customerWebId': customerWebId,
          'parameters.token': { $exists: true },
          'parameters.apiKey': { $exists: true },
          isParent: true,
        })
      : undefined;

    if (integrationUser) {
      const { userName, email } = await this.fetchUserData({
        ...integrationUser.parameters,
        extendedClaim,
      });

      const { color, logo } = await this.fetchLogoAndColor({
        ...integrationUser.parameters,
        extendedClaim,
      });

      const updateQuery: UpdateQuery<IApiIntegrationUserSchema> = {
        $set: {
          accessToken: extendedClaim,
          'config.color': color ? `#${color}` : parentUser?.config.color,
          'config.logo': logo
            ? convertBase64ContentToUri(logo)
            : parentUser?.config.logo,
          'config.mapIcon': parentUser?.config.mapIcon,
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
          { parameters: 1 },
        ));

      if (groupUser) {
        const groupUserParams =
          groupUser.parameters as IApiIntUserOnOfficeParams;

        const { userName, email } = await this.fetchUserData({
          ...groupUser.parameters,
          extendedClaim,
        });

        const { color, logo } = await this.fetchLogoAndColor({
          ...groupUser.parameters,
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
            apiKey: groupUserParams.apiKey,
            token: groupUserParams.token,
          },
          config: {
            color: color ? `#${color}` : parentUser?.config.color,
            logo: logo
              ? convertBase64ContentToUri(logo)
              : parentUser?.config.logo,
            mapIcon: parentUser?.config.mapIcon,
          },
          parentId: parentUser?.id,
        });
      }
    }

    if (!integrationUser) {
      this.logger.debug(this.login, integrationUserId, customerWebId);
      throw new HttpException('Die App muss neu aktiviert werden.', 400); // The app must be reactivated.
    }

    integrationUser.parentUser = parentUser;

    const availProdContingents =
      await this.integrationUserService.getAvailProdContingents(
        integrationUser,
      );

    const areaButlerEstate = await this.fetchAndProcessEstateData(
      estateId,
      integrationUser,
    );

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.upsertByIntParams(
        areaButlerEstate,
      ),
    );

    const snapshot = await this.locationIntService.fetchLatestSnapByIntId(
      integrationUser,
      estateId,
    );

    return {
      availProdContingents,
      integrationUserId,
      realEstate,
      isChild: !!integrationUser.parentId,
      accessToken: extendedClaim,
      config:
        this.integrationUserService.getIntUserResultConfig(integrationUser),
      latestSnapshot: snapshot
        ? mapSnapshotToEmbeddableMap(integrationUser, snapshot)
        : undefined,
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

    integrationUser = await this.integrationUserService.addProductContingents(
      integrationUser.id,
      convertOnOfficeProdToIntUserProd(product),
    );

    const parentUser = integrationUser.parentId
      ? await this.integrationUserService.findByDbId(integrationUser.parentId)
      : undefined;

    if (parentUser && checkIsParent(integrationUser, parentUser)) {
      integrationUser.parentUser = parentUser;
    }

    const snapshot = await this.locationIntService.fetchLatestSnapByIntId(
      integrationUser,
      integrationId,
    );

    return {
      accessToken,
      integrationUserId: integrationUser.integrationUserId,
      config:
        this.integrationUserService.getIntUserResultConfig(integrationUser),
      isChild: !!integrationUser.parentId,
      realEstate: mapRealEstateListingToApiRealEstateListing(
        integrationUser,
        await this.realEstateListingIntService.findOneOrFailByIntParams({
          integrationId,
          integrationUserId: integrationUser.integrationUserId,
          integrationType: this.integrationType,
        }),
      ),
      availProdContingents:
        await this.integrationUserService.getAvailProdContingents(
          integrationUser,
        ),
      latestSnapshot: snapshot
        ? mapSnapshotToEmbeddableMap(integrationUser, snapshot)
        : undefined,
    };
  }

  async updateEstateTextField(
    {
      parameters,
      config: { exportMatching },
      parentUser,
    }: TIntegrationUserDocument,
    { exportType, integrationId, text }: IApiIntUpdEstTextFieldReq,
  ): Promise<void> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.MODIFY;
    const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
    const timestamp = dayjs().unix();

    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const defaultMaxTextLength = 2000;
    const resExpMatching = exportMatching || parentUser?.config.exportMatching;
    let expMatchingParams = resExpMatching && resExpMatching[exportType];

    if (!expMatchingParams) {
      switch (exportType) {
        case AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS: {
          expMatchingParams = {
            fieldId: 'MPAreaButlerUrlWithAddress',
          };
          break;
        }

        case AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS: {
          expMatchingParams = {
            fieldId: 'MPAreaButlerUrlNoAddress',
          };
          break;
        }

        default: {
          expMatchingParams = {
            fieldId: openAiQueryTypeToOnOfficeEstateFieldMapping[exportType],
            maxTextLength: defaultMaxTextLength,
          };
        }
      }
    }

    const processedText =
      expMatchingParams.maxTextLength === 0
        ? text
        : text.slice(
            0,
            expMatchingParams.maxTextLength || defaultMaxTextLength,
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
                [expMatchingParams.fieldId]: processedText,
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
      parameters,
      config: { exportMatching },
      parentUser,
    }: TIntegrationUserDocument,
    {
      exportType,
      base64Content,
      fileTitle,
      integrationId,
      filename,
    }: IApiIntUploadEstateFileReq,
  ): Promise<void> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
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
              data: base64Content.replace(/^data:.*;base64,/, ''),
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

    const resExportMatching =
      exportMatching || parentUser?.config.exportMatching;

    if (resExportMatching && resExportMatching[exportType]) {
      finalRequest.request.actions[0].parameters.documentAttribute =
        resExportMatching[exportType].fieldId;
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

  async createEstateLink(
    { parameters }: TIntegrationUserDocument,
    { integrationId, title, url }: IApiIntCreateEstateLinkReq,
  ): Promise<void> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
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
              title,
              url,
              extendedclaim: extendedClaim,
              module: 'estate',
              Art: artType,
              relatedRecordId: integrationId,
            },
          },
        ],
      },
    };

    // TODO should be verified or removed in the future
    // if (exportMatching && exportMatching[exportType]) {
    //   request.request.actions[0].parameters.documentAttribute =
    //     exportMatching[exportType].fieldId;
    // }

    const response = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.createEstateLink.name,
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

  async fetchAvailStatuses({
    parameters,
  }: TIntegrationUserDocument): Promise<IApiRealEstAvailIntStatuses> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.GET;
    const resourceType = ApiOnOfficeResourceTypesEnum.FIELDS;

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
              labels: true,
              language: 'DEU',
              modules: ['estate'],
              fieldList: ['vermarktungsart', 'status2'],
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.fetchAvailStatuses.name,
      'Link upload failed!',
      request,
      response,
    );

    const estateStatuses =
      response.response.results[0].data.records[0].elements?.status2
        .permittedvalues;

    const estateMarketTypes =
      response.response.results[0].data.records[0].elements?.vermarktungsart
        .permittedvalues;

    return {
      estateStatuses: estateStatuses
        ? Object.keys(estateStatuses).map((key) => ({
            text: estateStatuses[key],
            value: key,
          }))
        : undefined,
      estateMarketTypes: estateMarketTypes
        ? Object.keys(estateMarketTypes).map((key) => ({
            text: estateMarketTypes[key],
            value: key,
          }))
        : undefined,
    };
  }

  private async fetchAndProcessEstateData(
    estateId: string,
    integrationUser: TIntegrationUserDocument,
  ): Promise<IApiRealEstateListingSchema> {
    const { integrationUserId, parameters } = integrationUser;
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
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
                'status2',
                'objektnr_extern',
              ],
              extendedclaim: extendedClaim,
              formatoutput: true,
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

    let locationAddress = `${street} ${houseNumber}, ${zipCode} ${city}, ${country}`;

    const locationCoordinates = {
      lat: parseOnOfficeFloat(lat),
      lng: parseOnOfficeFloat(lng),
    };

    let place = await this.placeService.fetchPlace({
      location: locationAddress,
      user: integrationUser,
    });

    if (!place) {
      locationAddress = undefined;

      place = await this.placeService.fetchPlace({
        location: locationCoordinates,
        user: integrationUser,
      });
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
      address: locationAddress || place.formatted_address,
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

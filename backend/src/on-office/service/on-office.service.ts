import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

import { configService } from '../../config/config.service';
import { activateUserPath } from '../shared/on-office.constants';
import { OnOfficeApiService } from '../../client/on-office/on-office-api.service';
import { IntegrationUserService } from '../../user/service/integration-user.service';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeArtTypesEnum,
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
  OnOfficeReqModuleEnum,
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
import {
  IApiIntUploadEstateFileReq,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';
import { RealEstateListingIntService } from '../../real-estate-listing/real-estate-listing-int.service';
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
import { ContingentIntService } from '../../user/service/contingent-int.service';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';
import { CompanyService } from '../../company/company.service';
import { ConvertIntUserService } from '../../user/service/convert-int-user.service';
import { OnOfficeEstateService } from './on-office-estate.service';
import { OnOfficeQueryBuilderService } from './query-builder/on-office-query-builder.service';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';
import { convertBase64ContentToUri } from '../../../../shared/functions/image.functions';
import {
  camelize,
  replaceUmlaut,
} from '../../../../shared/functions/shared.functions';
import { PotentialCustomerService } from '../../potential-customer/potential-customer.service';
import { IOnOfficeMulSelValue } from './query-builder/on-office-multiselect.mixin';
import { TIntUserObj } from '../../shared/types/user';

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
    private readonly onOfficeQueryBuilderService: OnOfficeQueryBuilderService,
    private readonly potentialCustomerService: PotentialCustomerService,
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

        product.transactionDbId = id as string;

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
    const generatedSignature = OnOfficeApiService.generateSignature(testUrl);

    if (generatedSignature === signature) {
      return;
    }

    this.logger.error(
      this.verifySignature.name,
      testUrl,
      generatedSignature,
      signature,
    );

    throw new UnauthorizedException('Request verification failed!');
  }

  async performLogin(
    {
      customerName,
      customerWebId,
      userId,
      estateId,
      parameterCacheId,
      apiClaim: extendedClaim,
    }: IApiOnOfficeLoginQueryParams,
    isFetchCustomFields?: boolean,
  ): Promise<IPerformLoginData> {
    const integrationUserId = `${customerWebId}-${userId}`;

    // single onOffice account can have multiple users and if one of the users activates the app, it will be activated for the others
    let integrationUser = await this.integrationUserService.findOne(
      this.integrationType,
      { integrationUserId },
    );

    let parentUser: TIntegrationUserDocument;

    if (integrationUser?.isParent) {
      parentUser = integrationUser;
    } else if (integrationUser?.parentUser) {
      parentUser = integrationUser.parentUser;
      parentUser.company = integrationUser.company;
    } else {
      parentUser = await this.integrationUserService.findOne(
        this.integrationType,
        {
          'parameters.customerWebId': customerWebId,
          'parameters.token': { $exists: true },
          'parameters.apiKey': { $exists: true },
          isParent: true,
        },
      );
    }

    const teamUser = !integrationUser
      ? parentUser ||
        (await this.integrationUserService.findOne(
          this.integrationType,
          {
            'parameters.customerWebId': customerWebId,
            'parameters.token': { $exists: true },
            'parameters.apiKey': { $exists: true },
          },
          { companyId: 1, parameters: 1 },
        ))
      : undefined;

    if (!integrationUser && !teamUser) {
      this.logger.debug(this.login, integrationUserId, customerWebId, userId);

      throw new UnprocessableEntityException(
        'Die App muss neu aktiviert werden.', // The app must be reactivated.
      );
    }

    const queryUser: TIntUserObj<IApiIntUserOnOfficeParams> = (
      integrationUser || teamUser
    ).toObject();
    Object.assign(queryUser.parameters, { extendedClaim, userId });

    const {
      getMultiselectValues,
      getColorAndLogo: { color, logo },
      getEstateData: estateData,
      getUserData: { email, userName },
    } = await this.onOfficeQueryBuilderService
      .setUser(queryUser)
      .getColorAndLogo()
      .getUserData()
      .getEstateData(estateId, isFetchCustomFields)
      .getMultiselectValues()
      .exec();

    if (!estateData) {
      throw new BadRequestException('Estate data is missing!');
    }

    if (integrationUser) {
      const parentId =
        !parentUser?.id || integrationUser.id === parentUser.id
          ? undefined
          : parentUser.id;

      integrationUser = await this.integrationUserService.findByDbIdAndUpdate(
        integrationUser.id,
        {
          $set: {
            parentId,
            accessToken: extendedClaim,
            'parameters.extendedClaim': extendedClaim,
            'parameters.parameterCacheId': parameterCacheId,
            'parameters.customerName': customerName,
            'parameters.userName': userName,
            'parameters.email': email,
          },
        },
      );
    }

    if (!integrationUser) {
      integrationUser = await this.integrationUserService.create({
        integrationUserId,
        accessToken: extendedClaim,
        companyId: teamUser.companyId,
        integrationType: this.integrationType,
        parameters: {
          parameterCacheId,
          customerName,
          customerWebId,
          userId,
          userName,
          email,
          extendedClaim,
          apiKey: teamUser.parameters.apiKey,
          token: (teamUser.parameters as IApiIntUserOnOfficeParams).token,
        },
        parentId: parentUser?.id,
      });

      integrationUser.company = teamUser.company;
      integrationUser.parentUser = parentUser;
    }

    await this.companyService.updateConfig(integrationUser.company, {
      color: color ? `#${color}` : undefined,
      logo: logo ? convertBase64ContentToUri(logo) : undefined,
    });

    await this.syncPotentCustomers(integrationUser, getMultiselectValues);

    const processedEstateData =
      await this.onOfficeEstateService.processEstateData(
        integrationUser,
        estateData,
      );

    return {
      integrationUser,
      ...processedEstateData,
    };
  }

  async uploadFile(
    { parameters, company: { config } }: TIntegrationUserDocument,
    {
      base64Image,
      exportType,
      filename,
      fileTitle,
      integrationId,
    }: IApiIntUploadEstateFileReq,
  ): Promise<void> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UPLOAD_FILE;

    const timestamp = dayjs().unix();
    const signature = OnOfficeApiService.generateSignature(
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
              data: base64Image.replace(/^data:.*;base64,/, ''),
            },
          },
        ],
      },
    };

    const initialResponse = await this.onOfficeApiService.sendRequest(
      initialRequest,
    );

    OnOfficeApiService.checkResponseIsSuccess(
      this.uploadFile.name,
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
              module: OnOfficeReqModuleEnum.ESTATE,
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

    const exportMatching = config?.exportMatching;

    if (exportMatching && exportMatching[exportType]) {
      finalRequest.request.actions[0].parameters.documentAttribute =
        exportMatching[exportType].fieldId;
    }

    const finalResponse = await this.onOfficeApiService.sendRequest(
      finalRequest,
    );

    OnOfficeApiService.checkResponseIsSuccess(
      this.uploadFile.name,
      'File upload failed on the 2nd step!',
      finalRequest,
      finalResponse,
    );
  }

  async syncPotentCustomers(
    integrationUser: TIntegrationUserDocument,
    multiselectValues: IOnOfficeMulSelValue[],
  ): Promise<void> {
    const existPotentCusNames =
      await this.potentialCustomerService.fetchNamesForSync(integrationUser);

    const sortedValues = structuredClone(multiselectValues).sort(
      ({ position: posA }, { position: posB }) => posA - posB,
    );

    let maxPosition = sortedValues[sortedValues.length - 1]?.position || 0;
    let previousPosition = 0;
    const availablePositions: number[] = [];

    const valuesToDelete = sortedValues.reduce<string[]>(
      (result, { fieldKey, fieldValue, position }) => {
        const positionDiff = position - previousPosition;

        if (positionDiff > 1) {
          for (
            let positionCounter = 1;
            positionCounter < positionDiff;
            positionCounter += 1
          ) {
            availablePositions.push(previousPosition + positionCounter);
          }
        }

        previousPosition = position;
        const isExists = existPotentCusNames.includes(fieldValue);

        if (!isExists) {
          result.push(fieldKey);
          availablePositions.push(position);
        }

        return result;
      },
      [],
    );

    const valuesToCreate = existPotentCusNames.reduce<IOnOfficeMulSelValue[]>(
      (result, potentCusName) => {
        const isExists = sortedValues.some(
          ({ fieldValue }) => fieldValue === potentCusName,
        );

        if (!isExists) {
          let newPosition = availablePositions.shift();

          if (!newPosition) {
            maxPosition += 1;
            newPosition = maxPosition;
          }

          result.push({
            fieldKey: camelize(replaceUmlaut(potentCusName)),
            fieldValue: potentCusName,
            position: newPosition,
          });
        }

        return result;
      },
      [],
    );

    if (!valuesToCreate.length && !valuesToDelete.length) {
      return;
    }

    const queryBuilder =
      this.onOfficeQueryBuilderService.setUser(integrationUser);

    if (valuesToDelete.length) {
      queryBuilder.deleteMultiselectValues(valuesToDelete);
    }

    if (valuesToCreate.length) {
      queryBuilder.createMultiselectValues(valuesToCreate);
    }

    await queryBuilder.exec().catch(() => {
      this.logger.debug(
        this.syncPotentCustomers.name,
        integrationUser.parameters,
      );
    });
  }
}

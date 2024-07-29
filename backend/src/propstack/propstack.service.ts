import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { plainToInstance } from 'class-transformer';
import { createCipheriv, createDecipheriv } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Types } from 'mongoose';

import { IntegrationUserService } from '../user/integration-user.service';
import {
  IApiIntCreateEstateLinkReq,
  IApiIntSetPropPubLinksReq,
  IApiIntUpdEstTextFieldReq,
  IApiIntUploadEstateFileReq,
  IApiRealEstAvailIntStatuses,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';
import {
  ApiPropstackImageTypeEnum,
  IApiPropstackConnectReq,
  IPropstackBroker,
  IPropstackLink,
} from '../shared/types/propstack';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import ApiPropstackFetchToAreaButlerDto from '../real-estate-listing/dto/api-propstack-fetch-to-area-butler.dto';
import {
  IApiIntUserLoginRes,
  IApiIntUserPropstackParams,
  IApiPropstackStoredBroker,
} from '@area-butler-types/integration-user';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import {
  IApiPropstackLoginQueryParams,
  IApiPropstackLoginReq,
  PropstackActionTypeEnum,
} from '@area-butler-types/propstack';
import {
  propstackOpenAiFieldMapper,
  propstackPropertyMarketTypeNames,
  propstackUrlFieldsMapper,
} from '../../../shared/constants/propstack/propstack-constants';
import { configService } from '../config/config.service';
import { PlaceService } from '../place/place.service';
import {
  ApiSearchResultSnapshotResponse,
  AreaButlerExportTypesEnum,
} from '@area-butler-types/types';
import {
  OpenAiQueryTypeEnum,
  TOpenAiLocDescType,
} from '@area-butler-types/open-ai';
import { FetchSnapshotService } from '../location/fetch-snapshot.service';
import { convertBase64ContentToUri } from '../../../shared/functions/image.functions';
import { ContingentIntService } from '../user/contingent-int.service';
import { openAiLocDescTypes } from '../../../shared/constants/open-ai';

@Injectable()
export class PropstackService {
  private readonly integrationType = IntegrationTypesEnum.PROPSTACK;
  private static readonly logger = new Logger(PropstackService.name);

  constructor(
    private readonly contingentIntService: ContingentIntService,
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly httpService: HttpService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly placeService: PlaceService,
    private readonly propstackApiService: PropstackApiService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
  ) {}

  async connect({
    apiKey,
    shopId,
    ...connectData
  }: IApiPropstackConnectReq): Promise<void> {
    const integrationUserId = `${shopId}`;
    const accessToken = PropstackService.encryptAccessToken(apiKey);
    const updateQuery = {
      accessToken,
      'parameters.apiKey': apiKey,
      'parameters.shopId': shopId,
    };

    Object.keys(connectData).forEach((key) => {
      updateQuery[`parameters.${key}`] = connectData[key];
    });

    const integrationUser = await this.integrationUserService.findOneAndUpdate(
      this.integrationType,
      { integrationUserId },
      updateQuery,
    );

    if (integrationUser) {
      return;
    }

    await this.integrationUserService.create({
      accessToken,
      integrationUserId,
      integrationType: this.integrationType,
      isContingentProvided: true,
      parameters: { apiKey, shopId, ...connectData },
      isParent: true,
    });
  }

  async setPropPublicLinks(
    integrationUser: TIntegrationUserDocument,
    { integrationId, publicLinkParams, exportType }: IApiIntSetPropPubLinksReq,
  ): Promise<void> {
    const { parameters } = integrationUser;

    publicLinkParams.map(({ title, url, isLinkEntity, isAddressShown }) => {
      if (
        integrationUser.config.exportMatching[
          AreaButlerExportTypesEnum.EMBEDDED_LINKS
        ]
      ) {
        return this.updatePropertyTextField(integrationUser, {
          exportType,
          integrationId,
          exportMatchParams: {
            fieldId: isAddressShown
              ? propstackUrlFieldsMapper.WITH_ADDRESS
              : propstackUrlFieldsMapper.WITHOUT_ADDRESS,
          },
          text: url,
        });
      }

      this.propstackApiService.createPropertyLink(
        (parameters as IApiIntUserPropstackParams).apiKey,
        {
          title,
          url,
          is_embedable: true,
          on_landing_page: true,
          property_id: parseInt(integrationId, 10),
        },
      );

      if (isLinkEntity) {
        return;
      }

      this.updatePropertyTextField(integrationUser, {
        exportType,
        integrationId,
        exportMatchParams: {
          fieldId: isAddressShown
            ? propstackUrlFieldsMapper.WITH_ADDRESS
            : propstackUrlFieldsMapper.WITHOUT_ADDRESS,
        },
        text: url,
      });
    });
  }

  private async getSnapshotRealEstate(
    integrationUser: TIntegrationUserDocument,
    propertyId: number,
  ): Promise<{
    latestSnapshot?: ApiSearchResultSnapshotResponse;
    realEstate: ApiRealEstateListing;
  }> {
    const { integrationUserId, parameters } = integrationUser;

    const property = await this.propstackApiService.fetchPropertyById(
      (parameters as IApiIntUserPropstackParams).apiKey,
      propertyId,
    );

    const {
      geometry: {
        location: { lat, lng },
      },
    } = await this.placeService.fetchPlaceOrFail({
      user: integrationUser,
      location: property.address,
    });

    const resultProperty = { ...property };

    Object.assign(resultProperty, {
      location: {
        type: 'Point',
        coordinates: [lat, lng],
      },
      integrationParams: {
        integrationUserId,
        integrationType: this.integrationType,
        integrationId: `${propertyId}`,
      },
    });

    const realEstateDto = plainToInstance(
      ApiPropstackFetchToAreaButlerDto,
      resultProperty,
    );

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.upsertOneByIntParams(
        realEstateDto,
      ),
    );

    return {
      realEstate,
      latestSnapshot: await this.fetchSnapshotService.fetchLastSnapshotByIntId(
        integrationUser,
        realEstate.id,
      ),
    };
  }

  async login(
    integrationUser: TIntegrationUserDocument,
    { propertyId, target, fieldName }: IApiPropstackLoginReq,
  ): Promise<IApiIntUserLoginRes> {
    const { accessToken, integrationUserId, parentId, subscription, poiIcons } =
      integrationUser;

    const { latestSnapshot, realEstate } = await this.getSnapshotRealEstate(
      integrationUser,
      propertyId,
    );

    return {
      accessToken,
      integrationUserId,
      latestSnapshot,
      realEstate,
      subscription,
      poiIcons,
      availProdContingents:
        await this.contingentIntService.getAvailProdContingents(
          integrationUser,
        ),
      config:
        this.integrationUserService.getIntUserResultConfig(integrationUser),
      isChild: !!parentId,
      openAiQueryType:
        target === PropstackActionTypeEnum.GENERATE_TEXT
          ? (propstackOpenAiFieldMapper.get(fieldName) as OpenAiQueryTypeEnum)
          : undefined,
    };
  }

  // Left just in case of possible future usage
  // async handleTargetGroupChanged(
  //   integrationUser: TIntegrationUserDocument,
  //   { propertyId, targetGroupName }: IApiPropstackTargetGroupChangedReq,
  // ): Promise<void> {
  //   const { latestSnapshot, realEstate } = await this.getSnapshotRealEstate(
  //     integrationUser,
  //     propertyId,
  //   );
  //
  //   const openAiDescriptions = await this.fetchTextFieldValues({
  //     targetGroupName,
  //     realEstateId: realEstate.id,
  //     snapshotId: latestSnapshot.id,
  //     user: integrationUser,
  //   });
  //
  //   await this.propstackApiService.updatePropertyById(
  //     (integrationUser.parameters as IApiIntUserPropstackParams).apiKey,
  //     propertyId,
  //     {
  //       ...openAiDescriptions,
  //     },
  //   );
  // }

  async updatePropertyTextField(
    {
      parameters,
      parentUser,
      config: { exportMatching },
    }: TIntegrationUserDocument,
    {
      exportType,
      exportMatchParams,
      integrationId,
      text,
    }: IApiIntUpdEstTextFieldReq,
  ): Promise<void> {
    const resExpMatching = exportMatching || parentUser?.config.exportMatching;
    let resExportMatchParams =
      exportMatchParams || (resExpMatching && resExpMatching[exportType]);
    const defaultMaxTextLength = 2000;

    if (
      !resExportMatchParams &&
      openAiLocDescTypes.includes(exportType as TOpenAiLocDescType)
    ) {
      resExportMatchParams = {
        fieldId: propstackOpenAiFieldMapper.get(
          exportType as TOpenAiLocDescType,
        ),
        maxTextLength: defaultMaxTextLength,
      };
    }

    if (!resExportMatchParams) {
      throw new UnprocessableEntityException(
        'Could not determine the field id!',
      );
    }

    const processedText =
      resExportMatchParams.maxTextLength === 0
        ? text
        : text.slice(
            0,
            resExportMatchParams.maxTextLength || defaultMaxTextLength,
          );

    const splitField = resExportMatchParams.fieldId.split('custom_fields.');

    await this.propstackApiService.updatePropertyById(
      (parameters as IApiIntUserPropstackParams).apiKey,
      parseInt(integrationId, 10),
      splitField.length > 1
        ? { partial_custom_fields: [{ [splitField[1]]: processedText }] }
        : { [resExportMatchParams.fieldId]: processedText },
    );
  }

  uploadPropertyImage(
    { parameters }: TIntegrationUserDocument,
    { base64Image, fileTitle, integrationId }: IApiIntUploadEstateFileReq,
  ): Promise<void> {
    return this.propstackApiService.uploadPropertyImage(
      (parameters as IApiIntUserPropstackParams).apiKey,
      {
        imageable_id: parseInt(integrationId, 10),
        imageable_type: ApiPropstackImageTypeEnum.PROPERTY,
        is_private: false,
        photo: base64Image,
        title: fileTitle,
      },
    );
  }

  createPropertyLink(
    { parameters }: TIntegrationUserDocument,
    { integrationId, title, url }: IApiIntCreateEstateLinkReq,
  ): Promise<IPropstackLink> {
    return this.propstackApiService.createPropertyLink(
      (parameters as IApiIntUserPropstackParams).apiKey,
      {
        title,
        url,
        is_embedable: true,
        on_landing_page: true,
        property_id: parseInt(integrationId, 10),
      },
    );
  }

  async fetchAvailStatuses({
    parameters,
  }: TIntegrationUserDocument): Promise<IApiRealEstAvailIntStatuses> {
    const { apiKey } = parameters as IApiIntUserPropstackParams;
    const propertyStatuses =
      await this.propstackApiService.fetchAvailPropStatuses(apiKey);

    const estateStatuses = propertyStatuses?.map(
      ({ id: value, name: text }) => ({
        text,
        value: `${value}`,
      }),
    );

    return {
      estateStatuses,
      estateMarketTypes: propstackPropertyMarketTypeNames,
    };
  }

  async getIntegrationUser(
    getIntUserParams: Omit<
      IApiPropstackLoginQueryParams,
      'propertyId' | 'textFieldType'
    >,
  ): Promise<TIntegrationUserDocument> {
    const { apiKey, shopId, brokerId, teamId } = getIntUserParams;
    let integrationUser: TIntegrationUserDocument;

    if (teamId) {
      integrationUser = await this.integrationUserService.findOne(
        this.integrationType,
        {
          integrationUserId: `${shopId}-${teamId}`,
          'parameters.apiKey': apiKey,
        },
      );

      if (integrationUser?.parentId) {
        integrationUser.parentUser = await this.integrationUserService.findOne(
          this.integrationType,
          {
            _id: new Types.ObjectId(integrationUser.parentId),
            isParent: true,
            'parameters.apiKey': apiKey,
          },
        );
      }
    }

    if (teamId && !integrationUser) {
      const parentUser = await this.integrationUserService.findOne(
        this.integrationType,
        {
          integrationUserId: `${shopId}`,
          isParent: true,
          'parameters.apiKey': apiKey,
        },
      );

      if (!parentUser) {
        return;
      }

      integrationUser = await this.integrationUserService.findOneAndUpdate(
        this.integrationType,
        {
          integrationUserId: `${shopId}-${teamId}`,
        },
        { 'parameters.apiKey': apiKey },
      );

      if (!integrationUser) {
        integrationUser = await this.integrationUserService
          .create({
            accessToken: PropstackService.encryptAccessToken(
              `${apiKey}-${teamId}`,
            ),
            config: {
              color: parentUser?.config.color,
              logo: parentUser?.config.logo,
              mapIcon: parentUser?.config.mapIcon,
            },
            integrationType: this.integrationType,
            integrationUserId: `${shopId}-${teamId}`,
            parameters: {
              apiKey,
              shopId: parseInt(shopId, 10),
              teamId: parseInt(teamId, 10),
            } as IApiIntUserPropstackParams,
            parentId: parentUser.id,
          })
          .catch((e) => {
            PropstackService.logger.error(this.getIntegrationUser.name, e);

            PropstackService.logger.debug(
              this.getIntegrationUser.name,
              `\nAPI key: ${apiKey}` +
                `\nShop id: ${shopId}` +
                `\nTeam id: ${teamId}`,
            );

            return undefined;
          });
      }

      integrationUser.parentUser = parentUser;
    }

    if (!teamId && !integrationUser) {
      integrationUser = await this.integrationUserService.findOne(
        this.integrationType,
        {
          integrationUserId: `${shopId}`,
          isParent: true,
          'parameters.apiKey': apiKey,
        },
      );
    }

    if (!integrationUser) {
      PropstackService.logger.error(
        this.getIntegrationUser.name,
        getIntUserParams,
      );

      throw new NotFoundException('Unable to find the integration user!');
    }

    const parsedBrokerId = parseInt(brokerId, 10);
    const intUserParams =
      integrationUser.parameters as IApiIntUserPropstackParams;
    intUserParams.brokerId = parsedBrokerId;
    integrationUser.markModified('parameters.brokerId');

    const {
      email,
      name,
      public_email: publicEmail,
      shop,
    } = await this.propstackApiService
      .fetchBrokerById(
        (integrationUser.parameters as IApiIntUserPropstackParams).apiKey,
        parsedBrokerId,
      )
      .catch((e) => {
        PropstackService.logger.error(this.getIntegrationUser.name, e);
        return {} as Partial<IPropstackBroker>;
      });

    if (shop?.logo_url) {
      const { data: logoData } = await firstValueFrom<{
        data: ArrayBuffer;
      }>(
        this.httpService.get<ArrayBuffer>(shop.logo_url, {
          responseType: 'arraybuffer',
        }),
      );

      if (logoData) {
        integrationUser.config.logo = convertBase64ContentToUri(
          Buffer.from(logoData).toString('base64'),
        );

        integrationUser.markModified('config.logo');
      }
    }

    if (shop?.color) {
      integrationUser.config.color = shop.color;
      integrationUser.markModified('config.color');
    }

    const broker: IApiPropstackStoredBroker = {
      name,
      brokerId: parsedBrokerId,
      email: publicEmail || email,
    };

    if (!intUserParams.brokers) {
      intUserParams.brokers = [];
    }

    const storedBroker = intUserParams.brokers.find(
      ({ brokerId: storedBrokerId }) => storedBrokerId === parsedBrokerId,
    );

    if (storedBroker) {
      Object.assign(storedBroker, broker);
    } else {
      intUserParams.brokers.push(broker);
    }

    integrationUser.markModified('parameters.brokers');

    return integrationUser.save();
  }

  static encryptAccessToken(apiKey: string): string {
    // left just in case to explain how the new keys are generated
    // const key =
    //   configService.getPropstackLoginSecret() ||
    //   randomBytes(32).toString('hex');

    const cipher = createCipheriv(
      'aes-256-ecb',
      Buffer.from(configService.getPropstackLoginSecret(), 'hex'),
      null,
    );

    return Buffer.concat([cipher.update(apiKey), cipher.final()]).toString(
      'hex',
    );
  }

  static decryptAccessToken(accessToken: string): string {
    this.logger.verbose(
      `\nMethod: ${this.decryptAccessToken.name}` +
        `\nAccess token: ${accessToken}` +
        `\nSecret: ${configService.getPropstackLoginSecret()}`,
    );

    const decipher = createDecipheriv(
      'aes-256-ecb',
      Buffer.from(configService.getPropstackLoginSecret(), 'hex'),
      null,
    );

    return Buffer.concat([
      decipher.update(Buffer.from(accessToken, 'hex')),
      decipher.final(),
    ]).toString();
  }
}

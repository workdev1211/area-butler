import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { plainToInstance } from 'class-transformer';
import { createCipheriv, createDecipheriv } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { FilterQuery, UpdateQuery } from 'mongoose';
import structuredClone from '@ungap/structured-clone';

import { IntegrationUserService } from '../user/integration-user.service';
import {
  IApiIntCreateEstateLinkReq,
  IApiIntSetPropPubLinksReq,
  IApiIntUploadEstateFileReq,
  IApiRealEstAvailIntStatuses,
  IntegrationTypesEnum,
  TUpdEstTextFieldParams,
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
  propstackLinkFieldMapper,
  propstackOpenAiFieldMapper,
  propstackPropertyMarketTypeNames,
} from '../../../shared/constants/propstack/propstack-constants';
import { configService } from '../config/config.service';
import { PlaceService } from '../place/place.service';
import {
  ApiSearchResultSnapshotResponse,
  AreaButlerExportTypesEnum,
} from '@area-butler-types/types';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { FetchSnapshotService } from '../location/fetch-snapshot.service';
import { convertBase64ContentToUri } from '../../../shared/functions/image.functions';
import { CompanyService } from '../company/company.service';
import { ConvertIntUserService } from '../user/convert-int-user.service';

@Injectable()
export class PropstackService {
  private readonly integrationType = IntegrationTypesEnum.PROPSTACK;
  private static readonly logger = new Logger(PropstackService.name);

  constructor(
    private readonly companyService: CompanyService,
    private readonly convertIntUserService: ConvertIntUserService,
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

    const { id: companyId } = await this.companyService.upsert(
      { [`integrationParams.${this.integrationType}.shopId`]: shopId },
      {
        [`integrationParams.${this.integrationType}`]: {
          [this.integrationType]: { shopId },
        },
      },
    );

    await this.integrationUserService.create({
      accessToken,
      companyId,
      integrationUserId,
      integrationType: this.integrationType,
      isContingentProvided: true,
      parameters: { apiKey, shopId, ...connectData },
      isParent: true,
    });
  }

  async setPropPublicLinks(
    integrationUser: TIntegrationUserDocument,
    { integrationId, publicLinkParams }: IApiIntSetPropPubLinksReq,
  ): Promise<void> {
    const exportMatching = integrationUser.company.config?.exportMatching;
    const textFieldsParams: TUpdEstTextFieldParams[] = [];

    for (const { exportType, isLinkEntity, title, url } of publicLinkParams) {
      const isExpMatchAvail = !!(exportMatching && exportMatching[exportType]);

      if (!isExpMatchAvail) {
        await this.createPropertyLink(integrationUser, {
          integrationId,
          title,
          url,
        });
      }

      if (isExpMatchAvail || !isLinkEntity) {
        textFieldsParams.push({ exportType, text: url });
      }
    }

    if (textFieldsParams.length) {
      await this.updatePropTextFields(
        integrationUser,
        integrationId,
        textFieldsParams,
      );
    }
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
    const { latestSnapshot, realEstate } = await this.getSnapshotRealEstate(
      integrationUser,
      propertyId,
    );

    return {
      latestSnapshot,
      realEstate,
      integrationUser: await this.convertIntUserService.convertDocToApiIntUser(
        integrationUser,
      ),
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

  async updatePropTextFields(
    { company: { config }, parameters }: TIntegrationUserDocument,
    integrationId: string,
    textFieldsParams: TUpdEstTextFieldParams[],
  ): Promise<void> {
    const customFieldKey = 'partial_custom_fields';
    const defaultMaxTextLength = 2000;
    const exportMatching = config?.exportMatching;

    const processTextFieldParams = ({
      exportType,
      text,
    }: TUpdEstTextFieldParams): [string, string | object] => {
      let exportMatchParams = exportMatching && exportMatching[exportType];

      if (!exportMatchParams) {
        switch (exportType) {
          case AreaButlerExportTypesEnum.LINK_WITH_ADDRESS:
          case AreaButlerExportTypesEnum.LINK_WO_ADDRESS: {
            exportMatchParams = {
              fieldId: propstackLinkFieldMapper[exportType],
            };
            break;
          }

          case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
          case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
          case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
            exportMatchParams = {
              fieldId: propstackOpenAiFieldMapper.get(exportType),
              maxTextLength: defaultMaxTextLength,
            };
            break;
          }

          default: {
            throw new UnprocessableEntityException(
              'Could not determine the field id!',
            );
          }
        }
      }

      const processedText =
        exportMatchParams.maxTextLength === 0
          ? text
          : text.slice(
              0,
              exportMatchParams.maxTextLength || defaultMaxTextLength,
            );

      const splitField = exportMatchParams.fieldId.split('custom_fields.');

      return splitField.length > 1
        ? [customFieldKey, { [splitField[1]]: processedText }]
        : [exportMatchParams.fieldId, processedText];
    };

    const data = textFieldsParams.reduce((result, textFieldParams) => {
      const [key, value] = processTextFieldParams(textFieldParams);

      if (key === customFieldKey && typeof value === 'object') {
        const customFields = result[key];
        result[key] = customFields ? { ...customFields, ...value } : value;
        return result;
      }

      result[key] = value;
      return result;
    }, {});

    await this.propstackApiService.updatePropertyById(
      (parameters as IApiIntUserPropstackParams).apiKey,
      parseInt(integrationId, 10),
      data,
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
    {
      integrationId,
      title,
      url,
    }: Omit<IApiIntCreateEstateLinkReq, 'exportType'>,
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

    const filterQuery: FilterQuery<TIntegrationUserDocument> = teamId
      ? {
          integrationUserId: `${shopId}-${teamId}`,
          'parameters.apiKey': apiKey,
        }
      : {
          integrationUserId: `${shopId}`,
          isParent: true,
          'parameters.apiKey': apiKey,
        };

    let integrationUser = await this.integrationUserService.findOne(
      this.integrationType,
      filterQuery,
    );

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

      integrationUser = await this.integrationUserService
        .create({
          accessToken: PropstackService.encryptAccessToken(
            `${apiKey}-${teamId}`,
          ),
          companyId: parentUser.companyId,
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

      integrationUser.parentUser = parentUser;
    }

    if (!integrationUser) {
      return;
    }

    const updateQuery: UpdateQuery<TIntegrationUserDocument> = { $set: {} };
    const parsedBrokerId = parseInt(brokerId, 10);
    updateQuery.$set['parameters.brokerId'] = parsedBrokerId;

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
      ).catch((e) => {
        PropstackService.logger.error(this.getIntegrationUser.name, e);
        return { data: undefined };
      });

      if (logoData) {
        updateQuery.$set['config.logo'] = convertBase64ContentToUri(
          Buffer.from(logoData).toString('base64'),
        );
      }
    }

    if (shop?.color) {
      updateQuery.$set['config.color'] = shop.color;
    }

    const broker: IApiPropstackStoredBroker = {
      name,
      brokerId: parsedBrokerId,
      email: publicEmail || email,
    };

    const storedBrokers = (
      integrationUser.parameters as IApiIntUserPropstackParams
    ).brokers;
    const brokers: IApiPropstackStoredBroker[] = storedBrokers?.length
      ? structuredClone(storedBrokers)
      : [];
    const storedBroker = brokers.find(
      ({ brokerId: storedBrokerId }) => storedBrokerId === parsedBrokerId,
    );

    if (storedBroker) {
      Object.assign(storedBroker, broker);
    } else {
      brokers.push(broker);
    }

    updateQuery.$set['parameters.brokers'] = brokers;

    return this.integrationUserService.findOneAndUpdate(
      this.integrationType,
      { _id: integrationUser._id },
      updateQuery,
    );
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

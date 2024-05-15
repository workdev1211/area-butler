import {
  Injectable,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { plainToInstance } from 'class-transformer';
import { createCipheriv, createDecipheriv } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Types } from 'mongoose';

import { IntegrationUserService } from '../user/integration-user.service';
import {
  IApiIntCreateEstateLinkReq,
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
  // IApiPropstackTargetGroupChangedReq,
  PropstackTextFieldTypeEnum,
} from '@area-butler-types/propstack';
import {
  propstackExportTypeMapper,
  propstackOpenAiFieldMapper,
  propstackPropertyMarketTypeNames,
} from '../../../shared/constants/propstack/propstack-constants';
import { configService } from '../config/config.service';
import { PlaceService } from '../place/place.service';
import {
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
} from '@area-butler-types/types';
import { LocationService } from '../location/location.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { defaultTargetGroupName } from '../../../shared/constants/potential-customer';
import { OpenAiTonalityEnum } from '@area-butler-types/open-ai';
import { defaultRealEstType } from '../../../shared/constants/open-ai';
import { UserDocument } from '../user/schema/user.schema';
import { FetchSnapshotService } from '../location/fetch-snapshot.service';
import { convertBase64ContentToUri } from '../../../shared/functions/image.functions';
import { ContingentIntService } from '../user/contingent-int.service';

interface IPropstackFetchTextFieldValues {
  realEstateId: string;
  snapshotId: string;
  user: UserDocument | TIntegrationUserDocument;
  eventId?: string; // only for the webhook events
  targetGroupName?: string;
}

@Injectable()
export class PropstackService {
  private readonly integrationType = IntegrationTypesEnum.PROPSTACK;
  private static readonly logger = new Logger(PropstackService.name);

  constructor(
    private readonly contingentIntService: ContingentIntService,
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly httpService: HttpService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly locationService: LocationService,
    private readonly placeService: PlaceService,
    private readonly propstackApiService: PropstackApiService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly realEstateListingService: RealEstateListingService,
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
      parameters: { apiKey, shopId, ...connectData },
      isParent: true,
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
        realEstate.integrationId,
      ),
    };
  }

  async login(
    integrationUser: TIntegrationUserDocument,
    { propertyId, textFieldType }: IApiPropstackLoginReq,
  ): Promise<IApiIntUserLoginRes> {
    const { accessToken, integrationUserId, parentId, subscription } =
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
      availProdContingents:
        await this.contingentIntService.getAvailProdContingents(
          integrationUser,
        ),
      config:
        this.integrationUserService.getIntUserResultConfig(integrationUser),
      isChild: !!parentId,
      openAiQueryType: propstackOpenAiFieldMapper[textFieldType],
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
    { parameters }: TIntegrationUserDocument,
    { exportType, integrationId, text }: IApiIntUpdEstTextFieldReq,
  ): Promise<void> {
    const paramName = propstackExportTypeMapper[exportType];

    if (!paramName) {
      throw new UnprocessableEntityException();
    }

    await this.propstackApiService.updatePropertyById(
      (parameters as IApiIntUserPropstackParams).apiKey,
      parseInt(integrationId, 10),
      { [paramName]: text },
    );
  }

  uploadPropertyImage(
    { parameters }: TIntegrationUserDocument,
    { base64Content, fileTitle, integrationId }: IApiIntUploadEstateFileReq,
  ): Promise<void> {
    return this.propstackApiService.uploadPropertyImage(
      (parameters as IApiIntUserPropstackParams).apiKey,
      {
        imageable_id: parseInt(integrationId, 10),
        imageable_type: ApiPropstackImageTypeEnum.PROPERTY,
        is_private: false,
        photo: base64Content,
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

  async getIntegrationUser({
    apiKey,
    shopId,
    brokerId,
    teamId,
  }: Omit<
    IApiPropstackLoginQueryParams,
    'propertyId' | 'textFieldType'
  >): Promise<TIntegrationUserDocument> {
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

    const parsedBrokerId = parseInt(brokerId, 10);
    const intUserParams =
      integrationUser.parameters as IApiIntUserPropstackParams;
    intUserParams.brokerId = parsedBrokerId;
    integrationUser.markModified('parameters.brokerId');

    const {
      email,
      name,
      public_email: publicEmail,
      shop: { color, logo_url: logoUrl },
    } = await this.propstackApiService
      .fetchBrokerById(
        (integrationUser.parameters as IApiIntUserPropstackParams).apiKey,
        parsedBrokerId,
      )
      .catch((e) => {
        PropstackService.logger.error(this.getIntegrationUser.name, e);
        return {} as Partial<IPropstackBroker>;
      });

    if (logoUrl) {
      const { data: logoData } = await firstValueFrom<{
        data: ArrayBuffer;
      }>(
        this.httpService.get<ArrayBuffer>(logoUrl, {
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

    if (color) {
      integrationUser.config.color = color;
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

  static encryptAccessToken(accessToken: string): string {
    // left just in case to explain how the new keys are generated
    // const key =
    //   configService.getPropstackLoginSecret() ||
    //   randomBytes(32).toString('hex');

    const cipher = createCipheriv(
      'aes-256-ecb',
      Buffer.from(configService.getPropstackLoginSecret(), 'hex'),
      null,
    );

    return Buffer.concat([cipher.update(accessToken), cipher.final()]).toString(
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

  async fetchTextFieldValues({
    eventId,
    realEstateId,
    snapshotId,
    user,
    targetGroupName = defaultTargetGroupName,
  }: IPropstackFetchTextFieldValues): Promise<
    Partial<Record<PropstackTextFieldTypeEnum, string>>
  > {
    const fetchOpenAiDescription = async (
      fetchDescription: Promise<string>,
      descriptionName: PropstackTextFieldTypeEnum,
    ): Promise<{ [p: string]: string }> => {
      return { [descriptionName]: await fetchDescription };
    };

    const openAiQueryResults = await Promise.allSettled([
      fetchOpenAiDescription(
        this.locationService.fetchOpenAiLocationDescription(user, {
          snapshotId,
          targetGroupName,
          meanOfTransportation: MeansOfTransportation.WALK,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        PropstackTextFieldTypeEnum.LOCATION_NOTE,
      ),
      fetchOpenAiDescription(
        this.realEstateListingService.fetchOpenAiRealEstateDesc(user, {
          realEstateId,
          targetGroupName,
          realEstateType: defaultRealEstType,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        PropstackTextFieldTypeEnum.DESCRIPTION_NOTE,
      ),
      fetchOpenAiDescription(
        this.locationService.fetchOpenAiLocRealEstDesc(user, {
          realEstateId,
          snapshotId,
          targetGroupName,
          meanOfTransportation: MeansOfTransportation.WALK,
          realEstateType: defaultRealEstType,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        PropstackTextFieldTypeEnum.OTHER_NOTE,
      ),
    ]);

    // this.logger.verbose(
    //   `Event ${eventId} continues to be processed for ${dayjs
    //     .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
    //     .humanize()}. Fetching of OpenAi descriptions is complete.`,
    // );

    return openAiQueryResults.reduce<
      Partial<Record<PropstackTextFieldTypeEnum, string>>
    >((result, queryResult) => {
      if (queryResult.status === 'fulfilled') {
        Object.assign(result, { ...queryResult.value });
      } else {
        const fetchErrorMessage = `The following error has occurred on fetching OpenAi descriptions: ${queryResult.reason}.`;

        PropstackService.logger.error(
          eventId ? `Event ${eventId}. ` : '' + fetchErrorMessage,
        );
      }

      return result;
    }, {});
  }
}

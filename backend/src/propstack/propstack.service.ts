import {
  Injectable,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { createCipheriv, createDecipheriv } from 'crypto';
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
  IPropstackLink,
} from '../shared/types/propstack';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  ApiRealEstateListing,
  IApiRealEstateListingSchema,
} from '@area-butler-types/real-estate';
import ApiPropstackFetchToAreaButlerDto from '../real-estate-listing/dto/api-propstack-fetch-to-area-butler.dto';
import {
  IApiIntUserLoginRes,
  IApiIntUserPropstackParams,
} from '@area-butler-types/integration-user';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import {
  IApiPropstackLoginReq,
  IApiPropstackTargetGroupChangedReq,
  PropstackTextFieldTypeEnum,
} from '@area-butler-types/propstack';
import { LocationIntService } from '../location/location-int.service';
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';
import {
  propstackExportTypeMapper,
  propstackOpenAiFieldMapper,
  propstackPropertyMarketTypeNames,
} from '../../../shared/constants/propstack';
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

interface IPropstackFetchTextFieldValues {
  realEstateListingId: string;
  searchResultSnapshotId: string;
  user: UserDocument | TIntegrationUserDocument;
  eventId?: string; // only for the webhook events
  targetGroupName?: string;
}

@Injectable()
export class PropstackService {
  private readonly integrationType = IntegrationTypesEnum.PROPSTACK;
  private static readonly logger = new Logger(PropstackService.name);

  constructor(
    private readonly integrationUserService: IntegrationUserService,
    private readonly propstackApiService: PropstackApiService,
    private readonly placeService: PlaceService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly locationIntService: LocationIntService,
    private readonly locationService: LocationService,
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  async connect({ apiKey, shopId }: IApiPropstackConnectReq): Promise<void> {
    const integrationUserId = `${shopId}`;
    const accessToken = PropstackService.encryptAccessToken(apiKey);

    const integrationUser = await this.integrationUserService.findOneAndUpdate(
      this.integrationType,
      { integrationUserId },
      { accessToken, 'parameters.apiKey': apiKey, 'parameters.shopId': shopId },
    );

    if (integrationUser) {
      return;
    }

    await this.integrationUserService.create({
      accessToken,
      integrationUserId,
      integrationType: this.integrationType,
      parameters: { apiKey, shopId },
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

    const areaButlerRealEstate = plainToInstance(
      ApiPropstackFetchToAreaButlerDto,
      resultProperty,
    ) as IApiRealEstateListingSchema;

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.upsertByIntParams(
        areaButlerRealEstate,
      ),
    );

    const snapshotDoc = await this.locationIntService.fetchLatestSnapByIntId(
      integrationUser,
      realEstate.integrationId,
    );

    return {
      realEstate,
      latestSnapshot: snapshotDoc
        ? mapSnapshotToEmbeddableMap(integrationUser, snapshotDoc)
        : undefined,
    };
  }

  async login(
    integrationUser: TIntegrationUserDocument,
    { propertyId, textFieldType }: IApiPropstackLoginReq,
  ): Promise<IApiIntUserLoginRes> {
    const { accessToken, integrationUserId, parentId } = integrationUser;
    const { latestSnapshot, realEstate } = await this.getSnapshotRealEstate(
      integrationUser,
      propertyId,
    );

    return {
      accessToken,
      integrationUserId,
      latestSnapshot,
      realEstate,
      config:
        this.integrationUserService.getIntUserResultConfig(integrationUser),
      isChild: !!parentId,
      openAiQueryType: propstackOpenAiFieldMapper[textFieldType],
    };
  }

  async handleTargetGroupChanged(
    integrationUser: TIntegrationUserDocument,
    { propertyId, targetGroupName }: IApiPropstackTargetGroupChangedReq,
  ): Promise<void> {
    const { latestSnapshot, realEstate } = await this.getSnapshotRealEstate(
      integrationUser,
      propertyId,
    );

    const openAiDescriptions = await this.fetchTextFieldValues({
      targetGroupName,
      realEstateListingId: realEstate.id,
      searchResultSnapshotId: latestSnapshot.id,
      user: integrationUser,
    });

    await this.propstackApiService.updatePropertyById(
      (integrationUser.parameters as IApiIntUserPropstackParams).apiKey,
      propertyId,
      {
        ...openAiDescriptions,
      },
    );
  }

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

  async getIntegrationUser(
    apiKey: string,
    shopId: string,
    teamId: string,
  ): Promise<TIntegrationUserDocument> {
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
            PropstackService.logger.error(e);

            PropstackService.logger.debug(
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

    return integrationUser;
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
    this.logger.debug(
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
    realEstateListingId,
    searchResultSnapshotId,
    user,
    eventId,
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
          searchResultSnapshotId,
          targetGroupName,
          meanOfTransportation: MeansOfTransportation.WALK,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        PropstackTextFieldTypeEnum.LOCATION_NOTE,
      ),
      fetchOpenAiDescription(
        this.realEstateListingService.fetchOpenAiRealEstateDesc(user, {
          realEstateListingId,
          targetGroupName,
          realEstateType: defaultRealEstType,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        PropstackTextFieldTypeEnum.DESCRIPTION_NOTE,
      ),
      fetchOpenAiDescription(
        this.locationService.fetchOpenAiLocRealEstDesc(user, {
          realEstateListingId,
          searchResultSnapshotId,
          targetGroupName,
          meanOfTransportation: MeansOfTransportation.WALK,
          realEstateType: defaultRealEstType,
          tonality: OpenAiTonalityEnum.FORMAL_SERIOUS,
        }),
        PropstackTextFieldTypeEnum.OTHER_NOTE,
      ),
    ]);

    // this.logger.log(
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

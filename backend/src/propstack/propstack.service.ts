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
} from '../shared/propstack.types';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import ApiPropstackFetchToAreaButlerDto from '../real-estate-listing/dto/api-propstack-fetch-to-area-butler.dto';
import { GoogleApiService } from '../client/google/google-api.service';
import {
  IApiIntUserLoginRes,
  IApiIntUserPropstackParams,
} from '@area-butler-types/integration-user';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { IApiPropstackLoginReq } from '@area-butler-types/propstack';
import { LocationIntService } from '../location/location-int.service';
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';
import {
  propstackExportTypeMapping,
  propstackPropertyMarketTypeNames,
} from '../../../shared/constants/propstack';
import { configService } from '../config/config.service';

@Injectable()
export class PropstackService {
  private readonly integrationType = IntegrationTypesEnum.PROPSTACK;
  private static readonly logger = new Logger(PropstackService.name);

  constructor(
    private readonly integrationUserService: IntegrationUserService,
    private readonly propstackApiService: PropstackApiService,
    private readonly googleApiService: GoogleApiService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly locationIntService: LocationIntService,
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

  async login(
    integrationUser: TIntegrationUserDocument,
    { propertyId }: IApiPropstackLoginReq,
  ): Promise<IApiIntUserLoginRes> {
    const { integrationUserId, accessToken, config, parameters, parentId } =
      integrationUser;

    const property = await this.propstackApiService.fetchPropertyById(
      (parameters as IApiIntUserPropstackParams).apiKey,
      propertyId,
    );

    const {
      geometry: {
        location: { lat, lng },
      },
    } = await this.googleApiService.fetchPlaceOrFail(property.address);

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

    const snapshot = await this.locationIntService.fetchLatestSnapByIntId(
      integrationUser,
      realEstate.integrationId,
    );

    return {
      integrationUserId,
      accessToken,
      config,
      realEstate,
      isChild: !!parentId,
      latestSnapshot: snapshot
        ? mapSnapshotToEmbeddableMap(integrationUser, snapshot)
        : undefined,
    };
  }

  async updatePropertyTextField(
    { parameters }: TIntegrationUserDocument,
    { exportType, integrationId, text }: IApiIntUpdEstTextFieldReq,
  ): Promise<void> {
    const paramName = propstackExportTypeMapping[exportType];

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
}

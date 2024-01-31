import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { createCipheriv, createDecipheriv } from 'crypto';

import { IntegrationUserService } from '../user/integration-user.service';
import {
  IApiRealEstAvailIntStatuses,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';
import { IApiPropstackConnectReq } from '../shared/propstack.types';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import ApiPropstackToAreaButlerDto from '../real-estate-listing/dto/api-propstack-to-area-butler.dto';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import {
  IApiIntUserLoginRes,
  IApiIntUserPropstackParams,
} from '@area-butler-types/integration-user';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { IApiPropstackLoginReq } from '@area-butler-types/propstack';
import { LocationIntService } from '../location/location-int.service';
import { mapSnapshotToEmbeddableMap } from '../location/mapper/embeddable-maps.mapper';
import { propstackRealEstMarketTypeNames } from '../../../shared/constants/propstack';
import { configService } from '../config/config.service';

@Injectable()
export class PropstackService {
  private readonly integrationType = IntegrationTypesEnum.PROPSTACK;

  constructor(
    private readonly integrationUserService: IntegrationUserService,
    private readonly propstackApiService: PropstackApiService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly locationIntService: LocationIntService,
  ) {}

  async connect(connectData: IApiPropstackConnectReq): Promise<void> {
    const { shopId, apiKey } = connectData;
    const integrationUserId = `${shopId}`;

    const integrationUser = await this.integrationUserService.findOne(
      this.integrationType,
      { integrationUserId, 'parameters.apiKey': apiKey },
    );

    const accessToken = PropstackService.encryptAccessToken(apiKey);

    if (!integrationUser) {
      await this.integrationUserService.create({
        accessToken,
        integrationUserId,
        integrationType: this.integrationType,
        parameters: connectData,
        isParent: true,
      });

      return;
    }

    Object.assign(integrationUser, {
      accessToken,
      integrationUserId,
      parameters: { ...integrationUser.parameters, ...connectData },
    });

    await integrationUser.save();
  }

  async login(
    parentIntUser: TIntegrationUserDocument,
    { realEstateId }: IApiPropstackLoginReq,
  ): Promise<IApiIntUserLoginRes> {
    const realEstate = await this.propstackApiService.fetchRealEstateById(
      (parentIntUser.parameters as IApiIntUserPropstackParams).apiKey,
      realEstateId,
    );

    const { department_id: departmentId, address } = realEstate;
    const place = await this.googleGeocodeService.fetchPlaceOrFail(address);

    const integrationUser = await this.getResultIntUser(
      parentIntUser,
      departmentId,
    );
    const { integrationUserId, accessToken, config, parentId } =
      integrationUser;

    Object.assign(realEstate, {
      address: address || place.formatted_address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      },
      integrationParams: {
        integrationUserId,
        integrationType: this.integrationType,
        integrationId: `${realEstateId}`,
      },
    });

    const areaButlerRealEstate = plainToInstance(
      ApiPropstackToAreaButlerDto,
      realEstate,
    ) as IApiRealEstateListingSchema;

    const resRealEstate = mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.upsertByIntParams(
        areaButlerRealEstate,
      ),
    );

    const snapshot = await this.locationIntService.fetchLatestSnapByIntId(
      integrationUser,
      resRealEstate.integrationId,
    );

    return {
      integrationUserId,
      accessToken,
      config,
      isChild: !!parentId,
      realEstate: resRealEstate,
      latestSnapshot: snapshot
        ? mapSnapshotToEmbeddableMap(integrationUser, snapshot)
        : undefined,
    };
  }

  async getResultIntUser(
    parentIntUser: TIntegrationUserDocument,
    departmentId?: number,
  ): Promise<TIntegrationUserDocument> {
    if (!departmentId) {
      return parentIntUser;
    }

    const {
      parameters,
      id: parentId,
      integrationUserId: parentIntUserId,
    } = parentIntUser;

    const { apiKey } = parameters as IApiIntUserPropstackParams;
    const integrationUserId = `${parentIntUserId}-${departmentId}`;

    const integrationUser = await this.integrationUserService.findOne(
      this.integrationType,
      { integrationUserId },
    );

    const accessToken = PropstackService.encryptAccessToken(
      `${apiKey}-${departmentId}`,
    );

    if (!integrationUser) {
      return this.integrationUserService.create({
        integrationUserId,
        accessToken,
        parentId,
        integrationType: this.integrationType,
        parameters: {
          ...parameters,
          departmentId,
        },
      });
    }

    if (
      (integrationUser.parameters as IApiIntUserPropstackParams).apiKey !==
      apiKey
    ) {
      Object.assign(integrationUser, {
        accessToken,
        parentId,
        parameters: { ...integrationUser.parameters, apiKey },
      });

      await integrationUser.save();
    }

    return integrationUser;
  }

  async fetchAvailStatuses({
    parameters,
  }: TIntegrationUserDocument): Promise<IApiRealEstAvailIntStatuses> {
    const { apiKey } = parameters as IApiIntUserPropstackParams;
    const realEstateStatuses =
      await this.propstackApiService.fetchRealEstAvailStatuses(apiKey);

    const estateStatuses = realEstateStatuses?.map(
      ({ id: value, name: text }) => ({
        text,
        value: `${value}`,
      }),
    );

    return {
      estateStatuses,
      estateMarketTypes: propstackRealEstMarketTypeNames,
    };
  }

  static encryptAccessToken(accessToken: string): string {
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

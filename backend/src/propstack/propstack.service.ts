import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { IntegrationUserService } from '../user/integration-user.service';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
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
      {
        $or: [
          { integrationUserId },
          { accessToken: apiKey, 'parameters.apiKey': apiKey },
        ],
      },
    );

    if (!integrationUser) {
      await this.integrationUserService.create({
        integrationUserId,
        integrationType: this.integrationType,
        accessToken: apiKey,
        parameters: connectData,
        isParent: true,
      });

      return;
    }

    Object.assign(integrationUser, {
      integrationUserId,
      accessToken: apiKey,
      parameters: { ...integrationUser.parameters, shopId, apiKey },
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
      { exposeUnsetFields: false },
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
    const accessToken = `${apiKey}-${departmentId}`;

    const integrationUser = await this.integrationUserService.findOne(
      this.integrationType,
      { integrationUserId },
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

    if (integrationUser.accessToken !== accessToken) {
      Object.assign(integrationUser, {
        accessToken,
        parentId,
        parameters: { ...integrationUser.parameters, apiKey },
      });

      await integrationUser.save();
    }

    return integrationUser;
  }
}

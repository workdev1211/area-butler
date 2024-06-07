import {
  HttpException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionFields } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import {
  IApiIntegrationParams,
  IApiUnlockIntProductReq,
  IntegrationActionTypeEnum,
} from '@area-butler-types/integration';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { initOpenAiReqQuantity } from '../../../shared/constants/on-office/on-office-products';
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  ApiIntUserPropstackProdContTypesEnum,
  TApiIntUserProdContType,
} from '@area-butler-types/integration-user';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { getProcUpdateQuery } from '../shared/functions/shared';
import { checkIsSearchNotUnlocked } from '../../../shared/functions/integration.functions';
import { ResultStatusEnum } from '@area-butler-types/types';
import { ContingentIntService } from '../user/contingent-int.service';

interface IUnlockProductParams {
  availProdContType: TApiIntUserProdContType;
  integrationId: string;
  actionType: IntegrationActionTypeEnum;
}

type TUpdateByIntParams = Partial<IApiRealEstateListingSchema> &
  Pick<IApiRealEstateListingSchema, 'integrationParams'>;

@Injectable()
export class RealEstateListingIntService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly contingentIntService: ContingentIntService,
    private readonly locationIndexService: LocationIndexService,
  ) {}

  async findOneByIntParams(
    {
      integrationId,
      integrationUserId,
      integrationType,
    }: IApiIntegrationParams,
    projectQuery?: ProjectionFields<RealEstateListingDocument>,
  ): Promise<RealEstateListingDocument> {
    return this.realEstateListingModel.findOne(
      {
        'integrationParams.integrationId': integrationId,
        'integrationParams.integrationUserId': integrationUserId,
        'integrationParams.integrationType': integrationType,
      },
      projectQuery,
    );
  }

  async findOneOrFailByIntParams({
    integrationId,
    integrationUserId,
    integrationType,
  }: IApiIntegrationParams): Promise<RealEstateListingDocument> {
    const existRealEstate = await this.findOneByIntParams({
      integrationId,
      integrationUserId,
      integrationType,
    });

    if (!existRealEstate) {
      throw new HttpException('Real estate listing not found!', 400);
    }

    return existRealEstate;
  }

  async bulkUpdateOneByIntParams(
    realEstateData: TUpdateByIntParams,
  ): Promise<ResultStatusEnum> {
    // integrationParams SHOULD NOT BE OVERWRITTEN because they keep the contingent information
    const {
      integrationParams: { integrationId, integrationUserId, integrationType },
      ...updateData
    } = realEstateData;

    const { matchedCount, modifiedCount } =
      await this.realEstateListingModel.updateOne(
        {
          'integrationParams.integrationId': integrationId,
          'integrationParams.integrationUserId': integrationUserId,
          'integrationParams.integrationType': integrationType,
        },
        getProcUpdateQuery(updateData),
      );

    return matchedCount === 1 || modifiedCount === 1
      ? ResultStatusEnum.SUCCESS
      : ResultStatusEnum.FAILURE;
  }

  async updateOneByIntParams(
    realEstateData: Partial<IApiRealEstateListingSchema> &
      Pick<IApiRealEstateListingSchema, 'integrationParams'>,
  ): Promise<RealEstateListingDocument> {
    // integrationParams SHOULD NOT BE OVERWRITTEN because they keep the contingent information
    const {
      integrationParams: { integrationId, integrationUserId, integrationType },
      ...updateData
    } = realEstateData;

    return this.realEstateListingModel.findOneAndUpdate(
      {
        'integrationParams.integrationId': integrationId,
        'integrationParams.integrationUserId': integrationUserId,
        'integrationParams.integrationType': integrationType,
      },
      getProcUpdateQuery(updateData),
      { new: true },
    );
  }

  async upsertOneByIntParams(
    realEstate: IApiRealEstateListingSchema,
  ): Promise<RealEstateListingDocument> {
    const existingRealEstate = await this.updateOneByIntParams(realEstate);

    if (existingRealEstate) {
      return existingRealEstate;
    }

    // TODO think about how the data should be retrieved - for a Point on in a certain radius
    // Because in real estate DB records coordinates are stored in the malformed GeoJSON format
    const locationIndexData = await this.locationIndexService.query({
      type: 'Point',
      coordinates: [
        realEstate.location.coordinates[1],
        realEstate.location.coordinates[0],
      ],
    });

    if (locationIndexData[0]) {
      Object.assign(realEstate, {
        locationIndices: locationIndexData[0].properties,
      });
    }

    return new this.realEstateListingModel(realEstate).save();
  }

  async handleProductUnlock(
    integrationUser: TIntegrationUserDocument,
    { actionType, integrationId }: IApiUnlockIntProductReq,
  ): Promise<void> {
    if (integrationUser.isSubscriptionActive) {
      throw new UnprocessableEntityException();
    }

    const availProdContType =
      await this.contingentIntService.getAvailProdContTypeOrFail(
        integrationUser,
        actionType,
      );

    await this.unlockProduct(integrationUser, {
      actionType,
      availProdContType,
      integrationId,
    });

    await this.contingentIntService.incrementProductUsage(
      integrationUser,
      availProdContType,
    );
  }

  private async unlockProduct(
    integrationUser: TIntegrationUserDocument,
    { actionType, availProdContType, integrationId }: IUnlockProductParams,
  ): Promise<void> {
    const realEstate = await this.findOneOrFailByIntParams({
      integrationId,
      integrationUserId: integrationUser.integrationUserId,
      integrationType: integrationUser.integrationType,
    });

    this.checkUnlockAction(actionType, realEstate);
    const iframeEndsAt = dayjs().add(6, 'months').toDate();

    switch (availProdContType) {
      case ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI:
      case ApiIntUserPropstackProdContTypesEnum.OPEN_AI: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        break;
      }

      case ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        realEstate.integrationParams.iframeEndsAt = iframeEndsAt;
        break;
      }

      case ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        realEstate.integrationParams.iframeEndsAt = iframeEndsAt;
        realEstate.integrationParams.isOnePageExportActive = true;
        break;
      }

      case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT:
      case ApiIntUserPropstackProdContTypesEnum.STATS_EXPORT: {
        realEstate.integrationParams.openAiRequestQuantity =
          initOpenAiReqQuantity;
        realEstate.integrationParams.iframeEndsAt = iframeEndsAt;
        realEstate.integrationParams.isOnePageExportActive = true;
        realEstate.integrationParams.isStatsFullExportActive = true;
        break;
      }
    }

    await realEstate.save();
  }

  private checkUnlockAction(
    actionType: IntegrationActionTypeEnum,
    {
      integrationParams: {
        iframeEndsAt,
        isStatsFullExportActive,
        isOnePageExportActive,
        openAiRequestQuantity,
      },
    }: RealEstateListingDocument,
  ): void {
    switch (actionType) {
      case IntegrationActionTypeEnum.UNLOCK_SEARCH: {
        if (
          checkIsSearchNotUnlocked({
            iframeEndsAt,
            isOnePageExportActive,
            isStatsFullExportActive,
            openAiRequestQuantity,
          })
        ) {
          return;
        }
        break;
      }

      case IntegrationActionTypeEnum.UNLOCK_OPEN_AI: {
        if (!openAiRequestQuantity) {
          return;
        }
        break;
      }

      case IntegrationActionTypeEnum.UNLOCK_IFRAME: {
        if (!iframeEndsAt || dayjs().isAfter(iframeEndsAt)) {
          return;
        }
        break;
      }

      case IntegrationActionTypeEnum.UNLOCK_ONE_PAGE: {
        if (!isOnePageExportActive) {
          return;
        }
        break;
      }

      case IntegrationActionTypeEnum.UNLOCK_STATS_EXPORT: {
        if (!isStatsFullExportActive) {
          return;
        }
        break;
      }
    }

    throw new UnprocessableEntityException();
  }
}

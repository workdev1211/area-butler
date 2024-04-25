import {
  HttpException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import {
  IApiIntegrationParams,
  TIntegrationActionTypes,
} from '@area-butler-types/integration';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { initOpenAiReqQuantity } from '../../../shared/constants/on-office/products';
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  TApiIntUserProdContTypes,
} from '@area-butler-types/integration-user';
import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { getProcUpdateQuery } from '../shared/functions/shared';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { OnOfficeIntActTypesEnum } from '@area-butler-types/on-office';

@Injectable()
export class RealEstateListingIntService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly locationIndexService: LocationIndexService,
  ) {}

  async findOneOrFailByIntParams({
    integrationId,
    integrationUserId,
    integrationType,
  }: IApiIntegrationParams): Promise<RealEstateListingDocument> {
    const existingRealEstateListing = await this.realEstateListingModel.findOne(
      {
        'integrationParams.integrationId': integrationId,
        'integrationParams.integrationUserId': integrationUserId,
        'integrationParams.integrationType': integrationType,
      },
    );

    if (!existingRealEstateListing) {
      throw new HttpException('Real estate listing not found!', 400);
    }

    return existingRealEstateListing;
  }

  async updateByIntParams(
    realEstateListing: Partial<IApiRealEstateListingSchema> &
      Pick<IApiRealEstateListingSchema, 'integrationParams'>,
  ): Promise<RealEstateListingDocument> {
    const {
      integrationParams: { integrationId, integrationUserId, integrationType },
      ...realEstateData
    } = realEstateListing;

    return this.realEstateListingModel.findOneAndUpdate(
      {
        'integrationParams.integrationId': integrationId,
        'integrationParams.integrationUserId': integrationUserId,
        'integrationParams.integrationType': integrationType,
      },
      getProcUpdateQuery(realEstateData),
      { new: true },
    );
  }

  async upsertByIntParams(
    realEstateListing: IApiRealEstateListingSchema,
  ): Promise<RealEstateListingDocument> {
    const existingRealEstate = await this.updateByIntParams(realEstateListing);

    if (existingRealEstate) {
      return existingRealEstate;
    }

    // Because in real estate DB records coordinates are stored in the malformed GeoJSON format
    const resultLocation = JSON.parse(
      JSON.stringify(realEstateListing.location),
    );
    resultLocation.coordinates = [
      resultLocation.coordinates[1],
      resultLocation.coordinates[0],
    ];

    const locationIndexData = await this.locationIndexService.query(
      resultLocation,
    );

    if (locationIndexData[0]) {
      Object.assign(realEstateListing, {
        locationIndices: locationIndexData[0].properties,
      });
    }

    return new this.realEstateListingModel(realEstateListing).save();
  }

  async unlockProduct(
    integrationUser: TIntegrationUserDocument,
    availProdContType: TApiIntUserProdContTypes,
    integrationId: string,
    actionType: TIntegrationActionTypes,
  ): Promise<void> {
    const realEstate = await this.findOneOrFailByIntParams({
      integrationId,
      integrationUserId: integrationUser.integrationUserId,
      integrationType: integrationUser.integrationType,
    });

    this.checkUnlockAction(actionType, realEstate);
    const iframeEndsAt = dayjs().add(6, 'months').toDate();

    switch (availProdContType) {
      case ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI: {
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

      case ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT: {
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
    actionType: TIntegrationActionTypes,
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
      case OnOfficeIntActTypesEnum.UNLOCK_SEARCH: {
        const isSearchNeeded =
          (!iframeEndsAt || dayjs().isAfter(iframeEndsAt)) &&
          !isOnePageExportActive &&
          !isStatsFullExportActive &&
          !openAiRequestQuantity;

        if (isSearchNeeded) {
          return;
        }
        break;
      }

      case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
      case OpenAiQueryTypeEnum.GENERAL_QUESTION:
      case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
      case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
      case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
        if (!openAiRequestQuantity) {
          return;
        }
        break;
      }

      case OnOfficeIntActTypesEnum.UNLOCK_IFRAME: {
        if (!iframeEndsAt || dayjs().isAfter(iframeEndsAt)) {
          return;
        }
        break;
      }

      case OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE: {
        if (!isOnePageExportActive) {
          return;
        }
        break;
      }

      case OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT: {
        if (!isStatsFullExportActive) {
          return;
        }
        break;
      }
    }

    throw new UnprocessableEntityException();
  }
}

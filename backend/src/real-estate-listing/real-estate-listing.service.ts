import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import { UserDocument } from '../user/schema/user.schema';
import {
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import { IApiOpenAiRealEstDescQuery } from '@area-butler-types/open-ai';
import { OpenAiService } from '../open-ai/open-ai.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { openAiTonalities } from '../../../shared/constants/open-ai';

@Injectable()
export class RealEstateListingService {
  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly subscriptionService: SubscriptionService,
    private readonly googleGeocodeService: GoogleGeocodeService,
    private readonly openAiService: OpenAiService,
  ) {}

  async fetchRealEstateListings(
    user: UserDocument | TIntegrationUserDocument,
    status = ApiRealEstateStatusEnum.ALL,
  ): Promise<RealEstateListingDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;
    let filter;

    if (isIntegrationUser) {
      filter = {
        'integrationParams.integrationUserId': user.integrationUserId,
        'integrationParams.integrationType': user.integrationType,
      };
    }

    if (!isIntegrationUser) {
      const userIds: string[] = [user.id];

      if (user.parentId) {
        userIds.push(user.parentId);
      }

      filter = {
        userId: { $in: userIds },
      };
    }

    if (status !== ApiRealEstateStatusEnum.ALL) {
      filter.status = status;
    }

    return this.realEstateListingModel.find(filter);
  }

  async createRealEstateListing(
    user: UserDocument,
    upsertData: ApiUpsertRealEstateListing,
    subscriptionCheck = true,
  ): Promise<RealEstateListingDocument> {
    // Further object creation is no longer possible for the current plan
    subscriptionCheck &&
      this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) => !subscriptionPlan,
        'Weitere Objekterstellung ist im aktuellen Plan nicht mehr möglich',
      );

    const realEstateListingDoc: Partial<RealEstateListingDocument> = {
      userId: user.id,
      ...upsertData,
    };

    return new this.realEstateListingModel(realEstateListingDoc).save();
  }

  async updateRealEstateListing(
    user: UserDocument | TIntegrationUserDocument,
    realEstateId: string,
    updatedData: Partial<ApiUpsertRealEstateListing>,
  ): Promise<RealEstateListingDocument> {
    const isIntegrationUser = 'integrationUserId' in user;
    const filterQuery: FilterQuery<RealEstateListingDocument> = {
      _id: new Types.ObjectId(realEstateId),
    };

    if (isIntegrationUser) {
      filterQuery['integrationParams.integrationUserId'] =
        user.integrationUserId;
      filterQuery['integrationParams.integrationType'] = user.integrationType;
    } else {
      filterQuery.userId = user.id;
    }

    const realEstate = await this.realEstateListingModel.findOneAndUpdate(
      filterQuery,
      updatedData,
      { new: true },
    );

    if (!realEstate) {
      throw new HttpException('Real estate not found!', 400);
    }

    return realEstate;
  }

  async deleteRealEstateListing(
    user: UserDocument,
    realEstateListingId: string,
  ): Promise<void> {
    const existingListing = await this.realEstateListingModel.findById(
      realEstateListingId,
    );

    if (!existingListing) {
      throw new HttpException('Real estate not found!', 400);
    }

    if (existingListing.userId !== user.id) {
      throw new HttpException('Invalid delete!', 400);
    }

    await existingListing.deleteOne();
  }

  async fetchRealEstateListingById(
    user: UserDocument | TIntegrationUserDocument,
    realEstateListingId: string,
  ): Promise<RealEstateListingDocument> {
    const isIntegrationUser = 'integrationUserId' in user;
    const filter = { _id: realEstateListingId };

    Object.assign(
      filter,
      isIntegrationUser
        ? {
            'integrationParams.integrationUserId': user.integrationUserId,
            'integrationParams.integrationType': user.integrationType,
          }
        : { userId: user.id },
    );

    const realEstateListing = await this.realEstateListingModel.findOne(filter);

    if (!realEstateListing) {
      throw new HttpException('Real estate listing not found!', 400);
    }

    return realEstateListing;
  }

  async fetchOpenAiRealEstateDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      realEstateListingId,
      realEstateType,
      textLength,
      targetGroupName,
      tonality,
    }: IApiOpenAiRealEstDescQuery,
    realEstateListing?: RealEstateListingDocument,
  ): Promise<string> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      // TODO think about moving everything to the UserSubscriptionPipe
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.openAi &&
          !subscriptionPlan.appFeatures.openAi,
        'Das Open AI Feature ist im aktuellen Plan nicht verfügbar',
      );
    }

    const resultingRealEstateListing =
      realEstateListing ||
      (await this.fetchRealEstateListingById(user, realEstateListingId));

    const queryText = this.openAiService.getRealEstDescQuery({
      targetGroupName,
      realEstateType,
      textLength,
      realEstateListing: resultingRealEstateListing,
      tonality: openAiTonalities[tonality],
    });

    return this.openAiService.fetchResponse(queryText);
  }
}

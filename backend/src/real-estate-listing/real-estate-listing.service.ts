import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
import { IApiOpenAiRealEstateDescriptionQuery } from '@area-butler-types/open-ai';
import { OpenAiService } from '../open-ai/open-ai.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

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
      const userIds = [user.id];

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

  async insertRealEstateListing(
    user: UserDocument,
    upsertData: ApiUpsertRealEstateListing,
    subscriptionCheck = true,
  ): Promise<RealEstateListingDocument> {
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
    user: UserDocument,
    realEstateListingId: string,
    upsertData: Partial<ApiUpsertRealEstateListing>,
  ): Promise<RealEstateListingDocument> {
    const existingListing = await this.realEstateListingModel.findById(
      realEstateListingId,
    );

    if (!existingListing) {
      throw new HttpException('Real estate not found!', 400);
    }

    if (existingListing.userId !== user.id) {
      throw new HttpException('Invalid change!', 400);
    }

    const realEstateListingDoc: Partial<RealEstateListingDocument> = {
      ...upsertData,
    };

    return this.realEstateListingModel.findByIdAndUpdate(
      realEstateListingId,
      realEstateListingDoc,
      { new: true },
    );
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
      responseLimit,
    }: IApiOpenAiRealEstateDescriptionQuery,
    realEstateListing?: RealEstateListingDocument,
  ) {
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

    const queryText = this.openAiService.getRealEstDescQuery(
      resultingRealEstateListing,
      responseLimit,
    );

    return this.openAiService.fetchResponse(queryText);
  }
}

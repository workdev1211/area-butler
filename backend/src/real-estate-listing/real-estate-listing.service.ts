import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import { UserDocument } from '../user/schema/user.schema';
import {
  IApiRealEstateListingSchema,
  IApiRealEstateStatuses,
  IApiRealEstStatusByUser,
} from '@area-butler-types/real-estate';
import { IApiOpenAiRealEstDescQuery } from '@area-butler-types/open-ai';
import { OpenAiService } from '../open-ai/open-ai.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { openAiTonalities } from '../../../shared/constants/open-ai';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { ApiCoordinates, ApiGeometry } from '@area-butler-types/types';
import { realEstateAllStatus } from '../../../shared/constants/real-estate';
import { mapRealEstateListingToApiRealEstateListing } from './mapper/real-estate-listing.mapper';

@Injectable()
export class RealEstateListingService {
  private readonly logger = new Logger(RealEstateListingService.name);

  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly subscriptionService: SubscriptionService,
    private readonly openAiService: OpenAiService,
    private readonly locationIndexService: LocationIndexService,
  ) {}

  async createRealEstateListing(
    user: UserDocument,
    upsertData: IApiRealEstateListingSchema,
    subscriptionCheck = true,
  ): Promise<RealEstateListingDocument> {
    // Further object creation is no longer possible for the current plan
    subscriptionCheck &&
      this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) => !subscriptionPlan,
        'Weitere Objekterstellung ist im aktuellen Plan nicht mehr möglich',
      );

    const realEstateListingDoc: IApiRealEstateListingSchema = {
      userId: user.id,
      ...upsertData,
    };

    await this.assignLocationIndices(
      realEstateListingDoc as IApiRealEstateListingSchema,
    );

    return new this.realEstateListingModel(realEstateListingDoc).save();
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

  async fetchRealEstateListings(
    user: UserDocument | TIntegrationUserDocument,
    statuses?: IApiRealEstateStatuses,
  ): Promise<RealEstateListingDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;
    let filter: FilterQuery<RealEstateListingDocument>;

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

    const resultStatus = statuses?.status || realEstateAllStatus;
    const resultStatus2 = statuses?.status2 || realEstateAllStatus;

    if (resultStatus !== realEstateAllStatus) {
      filter.status = resultStatus;
    }
    if (resultStatus2 !== realEstateAllStatus) {
      filter.status2 = resultStatus2;
    }

    return this.realEstateListingModel.find(filter);
  }

  async fetchStatusesByUser(
    user: UserDocument | TIntegrationUserDocument,
  ): Promise<IApiRealEstStatusByUser> {
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

    return (
      await this.realEstateListingModel.aggregate([
        { $match: filter },
        {
          $facet: {
            status: [
              { $match: { status: { $exists: true } } },
              { $group: { _id: '$status' } },
            ],
            status2: [
              { $match: { status2: { $exists: true } } },
              { $group: { _id: '$status2' } },
            ],
          },
        },
        {
          $project: { status: '$status._id', status2: '$status2._id' },
        },
      ])
    )[0];
  }

  async updateRealEstateListing(
    user: UserDocument | TIntegrationUserDocument,
    realEstateId: string,
    updatedData: Partial<IApiRealEstateListingSchema>,
  ): Promise<RealEstateListingDocument> {
    const isIntegrationUser = 'integrationUserId' in user;
    const filterQuery: FilterQuery<IApiRealEstateListingSchema> = {
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

  async updateEstateByExtParams(
    updateData: Partial<IApiRealEstateListingSchema> &
      Pick<IApiRealEstateListingSchema, 'externalSource' | 'externalId'>,
  ): Promise<RealEstateListingDocument> {
    const { userId, externalSource, externalId } = updateData;

    const filterQuery: FilterQuery<IApiRealEstateListingSchema> = {
      externalSource,
      externalId,
      userId,
    };

    return this.realEstateListingModel.findOneAndUpdate(
      filterQuery,
      updateData,
      { new: true },
    );
  }

  async updateLocationIndices(): Promise<void> {
    const total = await this.realEstateListingModel.find().count();
    const limit = 100;
    this.logger.log('Location index update starting!');

    for (let skip = 0; skip < total; skip += limit) {
      const realEstates = await this.realEstateListingModel
        .find()
        .skip(skip)
        .limit(limit);

      for await (const realEstate of realEstates) {
        const isAssigned = await this.assignLocationIndices(realEstate);

        if (isAssigned) {
          await realEstate.save();
        }
      }
    }

    this.logger.log('Location index update finished!');
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

  async fetchOpenAiRealEstateDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      realEstateId,
      realEstateType,
      targetGroupName,
      textLength,
      tonality,
    }: IApiOpenAiRealEstDescQuery,
    realEstate?: RealEstateListingDocument,
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

    const resultRealEstate = mapRealEstateListingToApiRealEstateListing(
      user,
      realEstate || (await this.fetchRealEstateListingById(user, realEstateId)),
    );

    const queryText = this.openAiService.getRealEstDescQuery({
      targetGroupName,
      realEstateType,
      textLength,
      realEstate: resultRealEstate,
      tonality: openAiTonalities[tonality],
    });

    return this.openAiService.fetchResponse(queryText);
  }

  async assignLocationIndices(
    realEstate: IApiRealEstateListingSchema,
  ): Promise<boolean> {
    const resultLocation: ApiGeometry = {
      type: 'Point',
      coordinates: [
        // Because in real estate DB records coordinates are stored in the malformed GeoJSON format
        realEstate.location.coordinates[1],
        realEstate.location.coordinates[0],
      ],
    };

    const locationIndexData = await this.locationIndexService.query(
      resultLocation,
    );

    if (locationIndexData[0]) {
      Object.assign(realEstate, {
        locationIndices: locationIndexData[0].properties,
      });

      return true;
    }

    return false;
  }

  async fetchRealEstateByCoords(
    user: UserDocument | TIntegrationUserDocument,
    coordinates: ApiCoordinates,
  ): Promise<RealEstateListingDocument> {
    const isIntegrationUser = 'integrationUserId' in user;
    const filterQuery: FilterQuery<IApiRealEstateListingSchema> = {
      'snapshot.location': coordinates,
    };

    Object.assign(
      filterQuery,
      isIntegrationUser
        ? {
            'integrationParams.integrationType': user.integrationType,
            'integrationParams.integrationUserId': user.integrationUserId,
          }
        : { userId: user.id },
    );

    return this.realEstateListingModel.findOne(filterQuery);
  }
}

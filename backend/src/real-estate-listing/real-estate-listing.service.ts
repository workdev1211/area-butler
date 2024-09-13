import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionFields, Types } from 'mongoose';

import {
  RealEstateListing,
  RealEstateListingDocument,
} from './schema/real-estate-listing.schema';
import { SubscriptionService } from '../user/subscription.service';
import { UserDocument } from '../user/schema/user.schema';
import {
  IApiRealEstateListingSchema,
  IApiRealEstStatusByUser,
} from '@area-butler-types/real-estate';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import {
  ApiCoordinates,
  ApiGeometry,
  ResultStatusEnum,
} from '@area-butler-types/types';
import { getProcUpdateQuery } from '../shared/functions/shared';

interface IFetchByLocationParams {
  address: string;
  coordinates: ApiCoordinates;
}

type TUpdateByExtParams = Partial<IApiRealEstateListingSchema> &
  Pick<IApiRealEstateListingSchema, 'externalId' | 'externalSource'>;

@Injectable()
export class RealEstateListingService {
  private readonly logger = new Logger(RealEstateListingService.name);

  constructor(
    @InjectModel(RealEstateListing.name)
    private readonly realEstateListingModel: Model<RealEstateListingDocument>,
    private readonly subscriptionService: SubscriptionService,
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

  async fetchById(
    user: UserDocument | TIntegrationUserDocument,
    realEstateId: string,
    projectQuery?: ProjectionFields<IApiRealEstateListingSchema>,
  ): Promise<RealEstateListingDocument> {
    const isIntegrationUser = 'integrationUserId' in user;
    const filterQuery: FilterQuery<IApiRealEstateListingSchema> = {
      _id: new Types.ObjectId(realEstateId),
    };

    Object.assign(
      filterQuery,
      isIntegrationUser
        ? {
            'integrationParams.integrationUserId': user.integrationUserId,
            'integrationParams.integrationType': user.integrationType,
          }
        : { userId: user.id },
    );

    return this.realEstateListingModel.findOne(filterQuery, projectQuery);
  }

  async fetchRealEstateListings(
    user: UserDocument | TIntegrationUserDocument,
    filterQuery?: FilterQuery<IApiRealEstateListingSchema>,
  ): Promise<RealEstateListingDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;
    const resFilterQuery: FilterQuery<IApiRealEstateListingSchema> = filterQuery
      ? { ...filterQuery }
      : {};

    if (isIntegrationUser) {
      Object.assign(resFilterQuery, {
        'integrationParams.integrationUserId': user.integrationUserId,
        'integrationParams.integrationType': user.integrationType,
      });
    }

    if (!isIntegrationUser) {
      const userIds: string[] = [user.id];

      if (user.parentId) {
        userIds.push(user.parentId);
      }

      Object.assign(resFilterQuery, {
        userId: { $in: userIds },
      });
    }

    return this.realEstateListingModel.find(resFilterQuery);
  }

  async fetchStatusesByUser(
    user: UserDocument | TIntegrationUserDocument,
  ): Promise<IApiRealEstStatusByUser> {
    const isIntegrationUser = 'integrationUserId' in user;
    let filterQuery: FilterQuery<RealEstateListingDocument>;

    if (isIntegrationUser) {
      filterQuery = {
        'integrationParams.integrationUserId': user.integrationUserId,
        'integrationParams.integrationType': user.integrationType,
      };
    }

    if (!isIntegrationUser) {
      const userIds: Types.ObjectId[] = [user._id];

      if (user.parentUser) {
        userIds.push(user.parentUser._id);
      }

      filterQuery = {
        userId: { $in: userIds },
      };
    }

    return (
      await this.realEstateListingModel.aggregate([
        { $match: filterQuery },
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

  async bulkUpdateOneByExtParams(
    realEstateData: TUpdateByExtParams,
  ): Promise<ResultStatusEnum> {
    const { externalId, externalSource, userId, ...updateData } =
      realEstateData;

    const { matchedCount, modifiedCount } =
      await this.realEstateListingModel.updateOne(
        {
          externalId,
          externalSource,
          userId,
        },
        getProcUpdateQuery(updateData),
      );

    return matchedCount === 1 || modifiedCount === 1
      ? ResultStatusEnum.SUCCESS
      : ResultStatusEnum.FAILURE;
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

  async fetchByLocation(
    user: UserDocument | TIntegrationUserDocument,
    { address, coordinates: { lat, lng } }: IFetchByLocationParams,
    projectQuery?: ProjectionFields<IApiRealEstateListingSchema>,
  ): Promise<RealEstateListingDocument> {
    const isIntegrationUser = 'integrationUserId' in user;

    const filterQuery: FilterQuery<IApiRealEstateListingSchema> = {
      $or: [{ address }, { 'location.coordinates': [lat, lng] }],
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

    return this.realEstateListingModel.findOne(filterQuery, projectQuery);
  }
}

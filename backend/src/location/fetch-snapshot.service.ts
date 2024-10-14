import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PopulateOptions,
  ProjectionFields,
  Types,
} from 'mongoose';
import { plainToInstance } from 'class-transformer';
import * as dayjs from 'dayjs';

import { SubscriptionService } from '../user/subscription.service';
import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { TApiMongoSortQuery } from '../shared/types/shared';
import ApiSearchResultSnapshotResponseDto, {
  TSnapshotResDtoData,
} from './dto/api-search-result-snapshot-response.dto';
import { addressExpiredMessage } from '../../../shared/messages/error.message';
import { LocationSearchDocument } from './schema/location-search.schema';
import { RealEstateListingDocument } from '../real-estate-listing/schema/real-estate-listing.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { IFetchEmbedMapQueryParams } from '@area-butler-types/location';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import {
  COMPANY_PATH,
  PARENT_USER_PATH,
  SNAPSHOT_INT_USER_PATH,
  SNAPSHOT_REAL_EST_PATH,
  SNAPSHOT_USER_PATH,
  SUBSCRIPTION_PATH,
} from '../shared/constants/schema';

interface IFetchSnapshotMainParams {
  filterQuery?: FilterQuery<SearchResultSnapshotDocument>;
  isFetchRealEstate?: boolean;
  isNotCheckOwner?: boolean;
  projectQuery?: ProjectionFields<SearchResultSnapshotDocument>;
  sortQuery?: TApiMongoSortQuery;
}

interface IFetchSnapshotsParams extends Partial<IFetchSnapshotMainParams> {
  skipNumber: number;
  limitNumber: number;
}

interface IFetchSnapDocByTokenParams
  extends Omit<IFetchSnapshotMainParams, 'filterQuery' | 'isFetchRealEstate'>,
    IFetchEmbedMapQueryParams<boolean> {}

interface IGetSnapshotResParams {
  snapshotDoc: SearchResultSnapshotDocument;
  isAddressShown?: boolean;
  isEmbedded?: boolean;
  isTrial?: boolean;
}

interface IFetchSnapshotAllParams
  extends IFetchSnapshotMainParams,
    Omit<IGetSnapshotResParams, 'snapshotDoc'> {}

@Injectable()
export class FetchSnapshotService {
  constructor(
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async fetchSnapshotDoc(
    user: UserDocument | TIntegrationUserDocument,
    {
      filterQuery,
      projectQuery,
      sortQuery,
      isFetchRealEstate = true,
      isNotCheckOwner,
    }: IFetchSnapshotMainParams,
  ): Promise<SearchResultSnapshotDocument> {
    const populateOptions: PopulateOptions = isFetchRealEstate
      ? {
          path: SNAPSHOT_REAL_EST_PATH,
          transform: (
            realEstate: RealEstateListingDocument | null,
          ): ApiRealEstateListing =>
            realEstate
              ? mapRealEstateListingToApiRealEstateListing(user, realEstate)
              : undefined,
        }
      : undefined;

    return this.searchResultSnapshotModel
      .findOne(
        await this.getFilterQueryWithUser(
          user,
          filterQuery,
          true,
          isNotCheckOwner,
        ),
        projectQuery,
      )
      .sort(sortQuery)
      .populate(populateOptions);
  }

  async fetchSnapshotDocByToken({
    isAddressShown,
    projectQuery,
    sortQuery,
    token,
  }: IFetchSnapDocByTokenParams): Promise<SearchResultSnapshotDocument> {
    let filterQuery: FilterQuery<SearchResultSnapshotDocument>;

    if (typeof isAddressShown === 'boolean') {
      filterQuery = isAddressShown
        ? { addressToken: token }
        : { unaddressToken: token };
    } else {
      filterQuery = { token };
    }

    return this.searchResultSnapshotModel
      .findOne(filterQuery, projectQuery)
      .sort(sortQuery)
      .populate({
        path: SNAPSHOT_USER_PATH,
        populate: [
          COMPANY_PATH,
          SUBSCRIPTION_PATH,
          {
            path: PARENT_USER_PATH,
            populate: [COMPANY_PATH, SUBSCRIPTION_PATH],
          },
        ],
      })
      .populate({
        path: SNAPSHOT_INT_USER_PATH,
        populate: [
          COMPANY_PATH,
          { path: PARENT_USER_PATH, populate: [COMPANY_PATH] },
        ],
      });
  }

  async getSnapshotRes(
    user: UserDocument | TIntegrationUserDocument,
    { isAddressShown, isEmbedded, isTrial, snapshotDoc }: IGetSnapshotResParams,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshotResDtoData: TSnapshotResDtoData = {
      ...snapshotDoc.toObject(),
      isAddressShown,
      isEmbedded,
      isTrial,
    };

    if (!snapshotResDtoData.config) {
      throw new HttpException("Config hasn't been exposed!", 500);
    }

    return plainToInstance(
      ApiSearchResultSnapshotResponseDto,
      snapshotResDtoData,
      { exposeUnsetFields: false, excludeExtraneousValues: false },
    );
  }

  async fetchSnapshot(
    user: UserDocument | TIntegrationUserDocument,
    {
      filterQuery,
      projectQuery,
      sortQuery,
      isEmbedded,
      isFetchRealEstate,
      isNotCheckOwner,
      isTrial,
    }: IFetchSnapshotAllParams,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshotDoc = await this.fetchSnapshotDoc(user, {
      isFetchRealEstate,
      filterQuery,
      sortQuery,
      projectQuery,
      isNotCheckOwner,
    });

    if (!snapshotDoc) {
      return;
    }

    return this.getSnapshotRes(user, {
      isEmbedded,
      isTrial,
      snapshotDoc,
    });
  }

  async fetchSnapshotByIdOrFail(
    user: UserDocument | TIntegrationUserDocument,
    snapshotId: string,
    isFetchRealEstate?: boolean,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshotDoc = await this.fetchSnapshotDoc(user, {
      isFetchRealEstate,
      filterQuery: {
        _id: new Types.ObjectId(snapshotId),
      },
    });

    if (!snapshotDoc) {
      throw new NotFoundException('Unknown snapshot id!');
    }

    if (!('integrationUserId' in user)) {
      this.checkLocationExpiration(snapshotDoc);
    }

    snapshotDoc.updatedAt = new Date();

    return this.getSnapshotRes(user, {
      snapshotDoc: await snapshotDoc.save(),
    });
  }

  async fetchLastSnapshotByIntId(
    integrationUser: TIntegrationUserDocument,
    realEstateId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.fetchSnapshot(integrationUser, {
      filterQuery: {
        realEstateId,
      },
      sortQuery: { createdAt: -1 },
    });
  }

  async fetchSnapshots(
    user: UserDocument | TIntegrationUserDocument,
    {
      filterQuery,
      projectQuery,
      sortQuery,
      skipNumber = 0,
      limitNumber = 0,
    }: IFetchSnapshotsParams,
  ): Promise<ApiSearchResultSnapshotResponse[]> {
    const snapshotDocs = await this.searchResultSnapshotModel
      .find(await this.getFilterQueryWithUser(user, filterQuery), projectQuery)
      .sort(sortQuery)
      .skip(skipNumber)
      .limit(limitNumber);

    return Promise.all(
      snapshotDocs.map((snapshotDoc) =>
        this.getSnapshotRes(user, { snapshotDoc }),
      ),
    );
  }

  checkLocationExpiration(
    location: LocationSearchDocument | SearchResultSnapshotDocument,
  ): void {
    const isLocationExpired = location?.endsAt
      ? dayjs().isAfter(location.endsAt)
      : false;

    if (isLocationExpired) {
      throw new HttpException(addressExpiredMessage, 402);
    }
  }

  async checkIntSnapshotIframeExp(
    integrationUser: TIntegrationUserDocument,
    snapshotDoc: SearchResultSnapshotDocument,
  ): Promise<void> {
    if (integrationUser.subscription) {
      return;
    }

    let iframeEndsAt: Date | string = snapshotDoc?.iframeEndsAt;

    if (!iframeEndsAt) {
      iframeEndsAt = (
        snapshotDoc.realEstate ||
        (
          await this.realEstateListingService.fetchById(
            integrationUser,
            snapshotDoc.realEstateId,
            { 'integrationParams.iframeEndsAt': 1 },
          )
        )?.integrationParams
      )?.iframeEndsAt;
    }

    const isSnapshotIframeExpired = iframeEndsAt
      ? dayjs().isAfter(iframeEndsAt)
      : true;

    if (isSnapshotIframeExpired) {
      throw new HttpException(addressExpiredMessage, 402);
    }
  }

  async getFilterQueryWithUser(
    user: UserDocument | TIntegrationUserDocument,
    filterQuery: FilterQuery<SearchResultSnapshotDocument> = {},
    isCheckSubscription = true,
    isNotCheckOwner = false,
  ): Promise<FilterQuery<SearchResultSnapshotDocument>> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser && isCheckSubscription) {
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.htmlSnippet &&
          !subscriptionPlan.appFeatures.htmlSnippet,
        'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
      );
    }

    if (isNotCheckOwner) {
      return filterQuery;
    }

    const resFilterQuery = { ...filterQuery };

    if (isIntegrationUser) {
      resFilterQuery['integrationParams.integrationUserId'] =
        user.integrationUserId;

      resFilterQuery['integrationParams.integrationType'] =
        user.integrationType;
    } else {
      resFilterQuery.userId = user.id;
    }

    return resFilterQuery;
  }
}

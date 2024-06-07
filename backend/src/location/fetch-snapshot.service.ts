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
  SNAPSHOT_REAL_EST_PATH,
} from './schema/search-result-snapshot.schema';
import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationUserService } from '../user/integration-user.service';
import { TApiMongoSortQuery } from '../shared/types/shared';
import ApiSearchResultSnapshotResponseDto, {
  TSnapshotResDtoData,
} from './dto/api-search-result-snapshot-response.dto';
import { addressExpiredMessage } from '../../../shared/messages/error.message';
import { LocationSearchDocument } from './schema/location-search.schema';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { RealEstateListingDocument } from '../real-estate-listing/schema/real-estate-listing.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';

interface IFetchSnapshotMainParams {
  isFetchRealEstate?: boolean;
  filterQuery?: FilterQuery<SearchResultSnapshotDocument>;
  projectQuery?: ProjectionFields<SearchResultSnapshotDocument>;
  sortQuery?: TApiMongoSortQuery;
}

interface IFetchSnapshotsParams extends Partial<IFetchSnapshotMainParams> {
  skipNumber: number;
  limitNumber: number;
}

interface IGetSnapshotResParams {
  snapshotDoc: SearchResultSnapshotDocument;
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
    private readonly integrationUserService: IntegrationUserService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async fetchSnapshotDoc(
    user: UserDocument | TIntegrationUserDocument,
    {
      filterQuery,
      projectQuery,
      sortQuery,
      isFetchRealEstate = true,
    }: IFetchSnapshotMainParams,
  ): Promise<SearchResultSnapshotDocument> {
    const populateOptions: PopulateOptions = isFetchRealEstate
      ? {
          path: SNAPSHOT_REAL_EST_PATH,
          transform: (
            realEstate: RealEstateListingDocument,
          ): ApiRealEstateListing =>
            mapRealEstateListingToApiRealEstateListing(user, realEstate),
        }
      : undefined;

    return this.searchResultSnapshotModel
      .findOne(
        await this.getFilterQueryWithUser(user, filterQuery),
        projectQuery,
      )
      .sort(sortQuery)
      .populate(populateOptions);
  }

  async fetchSnapshotDocByToken(
    token: string,
    fetchParams?: Omit<IFetchSnapshotMainParams, 'filterQuery'>,
  ): Promise<SearchResultSnapshotDocument> {
    return this.searchResultSnapshotModel
      .findOne({ token }, fetchParams?.projectQuery)
      .sort(fetchParams?.sortQuery);
  }

  async getSnapshotRes(
    user: UserDocument | TIntegrationUserDocument,
    { isEmbedded, isTrial, snapshotDoc }: IGetSnapshotResParams,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshotResDtoData: TSnapshotResDtoData = {
      ...snapshotDoc.toObject(),
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
      isTrial,
    }: IFetchSnapshotAllParams,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshotDoc = await this.fetchSnapshotDoc(user, {
      isFetchRealEstate,
      filterQuery,
      sortQuery,
      projectQuery,
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
    integrationId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    return this.fetchSnapshot(integrationUser, {
      filterQuery: { 'integrationParams.integrationId': integrationId },
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
    { isSubscriptionActive }: TIntegrationUserDocument,
    snapshotDoc: SearchResultSnapshotDocument,
  ): Promise<void> {
    if (isSubscriptionActive) {
      return;
    }

    let iframeEndsAt = snapshotDoc?.iframeEndsAt;

    if (!iframeEndsAt) {
      iframeEndsAt = (
        await this.realEstateListingIntService.findOneOrFailByIntParams(
          snapshotDoc.integrationParams,
        )
      ).integrationParams.iframeEndsAt;
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

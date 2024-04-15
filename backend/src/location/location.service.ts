import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';

import {
  LocationSearch,
  LocationSearchDocument,
} from './schema/location-search.schema';
import {
  convertMinutesToMeters,
  groupBy,
} from '../../../shared/functions/shared.functions';
import { SubscriptionService } from '../user/subscription.service';
import { OverpassDataService } from '../data-provision/overpass-data/overpass-data.service';
import { configService } from '../config/config.service';
import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import {
  ApiIsochrone,
  ApiOsmEntityCategory,
  ApiOsmLocation,
  ApiSearch,
  ApiSearchResponse,
  ApiUserRequests,
  MeansOfTransportation,
  OsmName,
  OsmType,
  TransportationParam,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import { IsochroneService } from '../client/isochrone/isochrone.service';
import { OverpassService } from '../client/overpass/overpass.service';
import {
  retrieveTotalRequestContingent,
  UserDocument,
} from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import {
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlanType,
  IApiSubscriptionLimitAmount,
} from '@area-butler-types/subscription-plan';
import { LimitIncreaseModelNameEnum } from '@area-butler-types/billing';
import { openAiTonalities } from '../../../shared/constants/open-ai';
import {
  IApiOpenAiLocDescQuery,
  IApiOpenAiLocRealEstDescQuery,
} from '@area-butler-types/open-ai';
import { OpenAiService } from '../open-ai/open-ai.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { ApiIntUserOnOfficeProdContTypesEnum } from '@area-butler-types/integration-user';
import { UsageStatisticsService } from '../user/usage-statistics.service';
import { TApiUsageStatsReqStatus } from '../shared/types/external-api';
import { IApiOverpassFetchNodes } from '@area-butler-types/overpass';
import { IntegrationUserService } from '../user/integration-user.service';
import { IApiLateSnapConfigOption } from '@area-butler-types/location';
import { FetchSnapshotService } from './fetch-snapshot.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(LocationSearch.name)
    private readonly locationSearchModel: Model<LocationSearchDocument>,
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly isochroneService: IsochroneService,
    private readonly openAiService: OpenAiService,
    private readonly overpassDataService: OverpassDataService,
    private readonly overpassService: OverpassService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly usageStatisticsService: UsageStatisticsService,
    private readonly userService: UserService,
  ) {}

  async searchLocation(
    user: UserDocument | TIntegrationUserDocument,
    search: ApiSearch,
  ): Promise<ApiSearchResponse> {
    // 'in' checks a schema but not a specific document
    const isIntegrationUser = 'integrationUserId' in user;

    const integrationParams = isIntegrationUser
      ? {
          integrationParams: {
            integrationId: search.integrationId,
            integrationUserId: user.integrationUserId,
            integrationType: user.integrationType,
          },
        }
      : undefined;

    const existingLocationFilter = {
      'locationSearch.coordinates': search.coordinates,
    };

    Object.assign(
      existingLocationFilter,
      isIntegrationUser ? integrationParams : { userId: user.id },
    );

    const existingLocation = await this.locationSearchModel.findOne(
      existingLocationFilter,
      { endsAt: 1 },
      { sort: { createdAt: -1 } },
    );

    if (!isIntegrationUser) {
      this.fetchSnapshotService.checkLocationExpiration(existingLocation);
    }

    if (!existingLocation && !isIntegrationUser) {
      let resultUser = user;

      if (user.parentId) {
        resultUser = await this.userService.findById({
          userId: user.parentId,
          withSubscription: true,
        });
      }

      await this.subscriptionService.checkSubscriptionViolation(
        resultUser.subscription.type,
        () =>
          resultUser.requestsExecuted + 1 >
          retrieveTotalRequestContingent(resultUser).reduce(
            (result, { amount }) => result + amount,
            0,
          ),
        'Im aktuellen Monat sind keine weiteren Abfragen möglich',
      );
    }

    const coordinates = search.coordinates;
    const preferredAmenities = search.preferredAmenities;
    const routingProfiles = {};

    const convertDistanceToMeters = (routingProfile: TransportationParam) => {
      const { amount } = routingProfile;

      if (routingProfile.unit === UnitsOfTransportation.KILOMETERS) {
        // convert km to m
        return amount * 1000;
      }

      return convertMinutesToMeters(amount, routingProfile.type);
    };

    for (const routingProfile of search.meansOfTransportation) {
      const fetchNodeParams: IApiOverpassFetchNodes = {
        coordinates,
        preferredAmenities,
        distanceInMeters: convertDistanceToMeters(routingProfile),
      };

      const locationsOfInterest = !!configService.useOverpassDb()
        ? await this.overpassDataService.findForCenterAndDistance(
            fetchNodeParams,
          )
        : await this.overpassService.fetchNodes(fetchNodeParams);

      const withIsochrone = search.withIsochrone !== false;

      const isochrone = withIsochrone
        ? await this.isochroneService.fetchIsochrone(
            routingProfile.type,
            coordinates,
            routingProfile.unit === UnitsOfTransportation.KILOMETERS
              ? routingProfile.amount * 1000
              : routingProfile.amount, // convert KM to M
            routingProfile.unit,
          )
        : null;

      routingProfiles[routingProfile.type] = {
        locationsOfInterest,
        isochrone,
      };
    }

    const location: Partial<LocationSearchDocument> = {
      locationSearch: search,
    };

    Object.assign(
      location,
      isIntegrationUser
        ? integrationParams
        : {
            userId: user.id,
            isTrial: user.subscription.type === ApiSubscriptionPlanType.TRIAL,
          },
    );

    if (!existingLocation && !isIntegrationUser) {
      const addressExpiration = this.subscriptionService.getLimitAmount(
        user.subscription.stripePriceId,
        ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION,
      );

      if (addressExpiration) {
        const currentDate = dayjs();
        const endsAt = dayjs(currentDate);

        Object.assign(location, {
          createdAt: currentDate.toDate(),
          endsAt: endsAt
            .add(
              addressExpiration.value,
              addressExpiration.unit as ManipulateType,
            )
            .toDate(),
        });
      }
    }

    if (existingLocation) {
      Object.assign(location, { endsAt: existingLocation.endsAt });
    }

    // TODO ask Kai what is the purpose of saving a new locationSearch record after each search request
    await new this.locationSearchModel(location).save();

    if (!existingLocation && !isIntegrationUser) {
      await this.userService.incrementExecutedRequestCount(user);
    }

    if (!existingLocation && isIntegrationUser) {
      await this.usageStatisticsService.logUsageStatistics(
        user,
        ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT,
        {} as TApiUsageStatsReqStatus,
      );
    }

    return {
      centerOfInterest: {
        entity: {
          label: 'Zentrum',
          name: OsmName.doctors,
          type: OsmType.amenity,
          category: ApiOsmEntityCategory.LEISURE,
        },
        coordinates,
        distanceInMeters: 0,
        address: {
          street: 'Mein Standort',
        },
      },
      routingProfiles: routingProfiles as Record<
        MeansOfTransportation,
        { locationsOfInterest: ApiOsmLocation[]; isochrone: ApiIsochrone }
      >,
    };
  }

  async latestUserRequests(user: UserDocument): Promise<ApiUserRequests> {
    // TODO think about using class-transformer for mapping
    const requests = (
      await this.locationSearchModel
        .find({ userId: user.id }, { id: 1, locationSearch: 1, endsAt: 1 })
        .sort({ createdAt: -1 })
    ).map(({ locationSearch, endsAt, id }) => ({
      ...locationSearch,
      id,
      endsAt,
    }));

    // TODO think about using lodash.groupBy or making all the grouping (etc, etc) in one cycle
    const grouped = groupBy(
      requests,
      (request: ApiSearch) =>
        `${request.coordinates.lat}${request.coordinates.lng}`,
    );

    return {
      requests: Object.values(grouped).map((g) => g[0]),
    };
  }

  async deleteTrialDataByUserId(userId: string): Promise<void> {
    await this.locationSearchModel.deleteMany({
      userId,
      isTrial: true,
    });

    await this.searchResultSnapshotModel.deleteMany({
      userId,
      isTrial: true,
    });
  }

  async fetchLastSnapConfigs(
    user: UserDocument | TIntegrationUserDocument,
    limitNumber: number,
  ): Promise<IApiLateSnapConfigOption[]> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.htmlSnippet &&
          !subscriptionPlan.appFeatures.htmlSnippet,
        'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
      );
    }

    const matchQuery = { $and: [] };

    if (isIntegrationUser) {
      matchQuery['$and'].push({
        'integrationParams.integrationUserId': user.integrationUserId,
        'integrationParams.integrationType': user.integrationType,
      });
    } else {
      matchQuery['$and'].push({
        userId: user.id,
      });
    }

    const pipelines: any = [{ $match: matchQuery }, { $limit: limitNumber }];

    const parentUserId = user.parentId;
    let parentTemplateSnapId: string;

    if (parentUserId) {
      const parentUser = isIntegrationUser
        ? await this.integrationUserService.findByDbId(parentUserId, {
            'config.templateSnapshotId': 1,
          })
        : await this.userService.findById({
            userId: parentUserId,
            projectQuery: {
              templateSnapshotId: 1,
            },
          });

      const isParentIntUser = 'integrationUserId' in parentUser;

      parentTemplateSnapId = isParentIntUser
        ? parentUser.config.templateSnapshotId
        : parentUser.templateSnapshotId;

      if (parentTemplateSnapId) {
        pipelines.push({
          $unionWith: {
            coll: 'searchresultsnapshots',
            pipeline: [
              { $match: { _id: new Types.ObjectId(parentTemplateSnapId) } },
              {
                $set: {
                  isParentTemplate: true,
                  'snapshot.placesLocation.label': {
                    $concat: ['Elternteil: ', '$snapshot.placesLocation.label'],
                  },
                },
              },
            ],
          },
        });
      }
    }

    const userTemplateSnapId = isIntegrationUser
      ? user.config.templateSnapshotId
      : user.templateSnapshotId;

    if (userTemplateSnapId) {
      matchQuery['$and'].push({
        _id: { $not: { $eq: new Types.ObjectId(userTemplateSnapId) } },
      });

      pipelines.push({
        $unionWith: {
          coll: 'searchresultsnapshots',
          pipeline: [
            { $match: { _id: new Types.ObjectId(userTemplateSnapId) } },
            {
              $set: {
                isUserTemplate: true,
                'snapshot.placesLocation.label': {
                  $concat: ['Benutzer: ', '$snapshot.placesLocation.label'],
                },
              },
            },
          ],
        },
      });
    }

    pipelines.push(
      { $sort: { isParentTemplate: -1, isUserTemplate: -1 } },
      {
        $project: {
          config: 1,
          'snapshot.placesLocation.label': 1,
        },
      },
    );

    const snapshots =
      await this.searchResultSnapshotModel.aggregate<SearchResultSnapshotDocument>(
        pipelines,
      );

    return snapshots.map(
      ({
        _id,
        config,
        snapshot: {
          placesLocation: { label },
        },
      }) => ({ id: `${_id}`, label, config }),
    );
  }

  async prolongAddressDuration(
    modelName: LimitIncreaseModelNameEnum,
    modelId: string,
    { value, unit }: IApiSubscriptionLimitAmount,
  ): Promise<void> {
    const endsAt = dayjs()
      .add(value, unit as ManipulateType)
      .toDate();

    switch (modelName) {
      case LimitIncreaseModelNameEnum.LocationSearch: {
        await this.locationSearchModel.updateOne(
          {
            _id: modelId,
          },
          { endsAt },
          { sort: { createdAt: -1 } },
        );
        break;
      }

      case LimitIncreaseModelNameEnum.SearchResultSnapshot: {
        await this.searchResultSnapshotModel.updateOne(
          {
            _id: modelId,
          },
          { endsAt },
        );
      }
    }
  }

  async fetchOpenAiLocationDescription(
    user: UserDocument | TIntegrationUserDocument,
    {
      customText,
      isForOnePage,
      meanOfTransportation,
      snapshotId,
      targetGroupName,
      textLength,
      tonality,
    }: IApiOpenAiLocDescQuery,
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

    const snapshotRes = await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
      user,
      snapshotId,
      false,
    );

    const queryText = await this.openAiService.getLocDescQuery(user, {
      customText,
      isForOnePage,
      meanOfTransportation,
      snapshotRes,
      targetGroupName,
      textLength,
      tonality: openAiTonalities[tonality],
    });

    return this.openAiService.fetchResponse(queryText);
  }

  async fetchOpenAiLocRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      customText,
      meanOfTransportation,
      realEstateType,
      snapshotId,
      targetGroupName,
      textLength,
      tonality,
    }: IApiOpenAiLocRealEstDescQuery,
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

    const snapshotRes = await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
      user,
      snapshotId,
    );

    const queryText = await this.openAiService.getLocRealEstDescQuery(user, {
      customText,
      meanOfTransportation,
      realEstateType,
      snapshotRes,
      targetGroupName,
      textLength,
      tonality: openAiTonalities[tonality],
    });

    return this.openAiService.fetchResponse(queryText);
  }
}

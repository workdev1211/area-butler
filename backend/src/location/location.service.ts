import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';

import {
  LocationSearch,
  LocationSearchDocument,
} from './schema/location-search.schema';
import { calculateMinutesToMeters } from '../../../shared/constants/constants';
import { groupBy } from '../../../shared/functions/shared.functions';
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
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  ApiUpdateSearchResultSnapshot,
  ApiUserRequests,
  IApiMongoParams,
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
import { addressExpiredMessage } from '../../../shared/messages/error.message';
import { LimitIncreaseModelNameEnum } from '@area-butler-types/billing';
import { defaultSnapshotConfig } from '../../../shared/constants/location';
import { openAiTonalities } from '../../../shared/constants/open-ai';
import {
  IApiOpenAiLocationDescriptionQuery,
  IApiOpenAiLocationRealEstateDescriptionQuery,
} from '@area-butler-types/open-ai';
import { OpenAiService } from '../open-ai/open-ai.service';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationUserService } from '../user/integration-user.service';
import { ApiIntUserOnOfficeProdContTypesEnum } from '@area-butler-types/integration-user';

@Injectable()
export class LocationService {
  constructor(
    private readonly overpassService: OverpassService,
    private readonly isochroneService: IsochroneService,
    @InjectModel(LocationSearch.name)
    private readonly locationSearchModel: Model<LocationSearchDocument>,
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly userService: UserService,
    private readonly integrationUserService: IntegrationUserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly overpassDataService: OverpassDataService,
    private readonly openAiService: OpenAiService,
    private readonly realEstateListingService: RealEstateListingService,
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
      this.checkLocationExpiration(existingLocation);
    }

    if (!existingLocation && !isIntegrationUser) {
      let parentUser = user;

      if (user.parentId) {
        parentUser = await this.userService.findById(user.parentId);

        parentUser.subscription =
          await this.subscriptionService.findActiveByUserId(parentUser.id);
      }

      // TODO change map and reduce to reduce only
      await this.subscriptionService.checkSubscriptionViolation(
        parentUser.subscription.type,
        () =>
          parentUser.requestsExecuted + 1 >
          retrieveTotalRequestContingent(parentUser)
            .map((c) => c.amount)
            .reduce((acc, inc) => acc + inc),
        'Im aktuellen Monat sind keine weiteren Abfragen möglich',
      );
    }

    const coordinates = search.coordinates;
    const preferredAmenities = search.preferredAmenities;
    const routingProfiles = {};

    function deriveMeterEquivalent(routingProfile: TransportationParam) {
      const { amount } = routingProfile;

      if (routingProfile.unit === UnitsOfTransportation.KILOMETERS) {
        // convert km to m
        return amount * 1000;
      }

      switch (routingProfile.type) {
        case MeansOfTransportation.BICYCLE:
          return (
            amount *
            1.2 *
            calculateMinutesToMeters.find(
              (mtm) => mtm.mean === MeansOfTransportation.BICYCLE,
            )?.multiplicator
          );

        case MeansOfTransportation.CAR:
          return (
            amount *
            1.2 *
            calculateMinutesToMeters.find(
              (mtm) => mtm.mean === MeansOfTransportation.CAR,
            )?.multiplicator
          );

        case MeansOfTransportation.WALK:
          return (
            amount *
            1.2 *
            calculateMinutesToMeters.find(
              (mtm) => mtm.mean === MeansOfTransportation.WALK,
            )?.multiplicator
          );

        default:
          return 0;
      }
    }

    for (const routingProfile of search.meansOfTransportation) {
      const locationsOfInterest = !!configService.useOverpassDb()
        ? await this.overpassDataService.findForCenterAndDistance(
            coordinates,
            deriveMeterEquivalent(routingProfile),
            preferredAmenities,
          )
        : await this.overpassService.fetchEntities(
            coordinates,
            deriveMeterEquivalent(routingProfile),
            preferredAmenities,
          );

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
      await this.integrationUserService.incrementUsageStatsParam(
        user.id,
        ApiIntUserOnOfficeProdContTypesEnum.MAP_SNAPSHOT,
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

  async createSnapshot(
    user: UserDocument,
    snapshot: ApiSearchResultSnapshot,
    config?: ApiSearchResultSnapshotConfig,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const token = randomBytes(60).toString('hex');

    const mapboxAccessToken = (
      await this.userService.createMapboxAccessToken(user)
    ).mapboxAccessToken;

    let parsedConfig = config;

    // a standard flow - we should use a config from a previous snapshot
    if (!parsedConfig) {
      const snapshot = (
        await this.fetchSnapshots(user, 0, 1, { config: 1 }, { updatedAt: -1 })
      )[0];

      parsedConfig = snapshot?.config || defaultSnapshotConfig;
    }

    const snapshotDoc = {
      mapboxAccessToken,
      snapshot,
      token,
      config: parsedConfig,
      userId: user.id,
      isTrial: user.subscription.type === ApiSubscriptionPlanType.TRIAL,
    };

    const addressExpiration = this.subscriptionService.getLimitAmount(
      user.subscription.stripePriceId,
      ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION,
    );

    if (addressExpiration) {
      const createdAt = dayjs();
      const endsAt = dayjs(createdAt)
        .add(addressExpiration.value, addressExpiration.unit as ManipulateType)
        .toDate();

      Object.assign(snapshotDoc, { createdAt, endsAt });
    }

    const savedSnapshotDoc = await new this.searchResultSnapshotModel(
      snapshotDoc,
    ).save();

    return {
      id: savedSnapshotDoc.id,
      token,
      snapshot,
      config: parsedConfig,
      mapboxAccessToken,
      createdAt: savedSnapshotDoc.createdAt,
      endsAt: savedSnapshotDoc.endsAt,
    };
  }

  async fetchEmbeddedMap(token: string): Promise<SearchResultSnapshotDocument> {
    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      token,
    });

    if (!snapshotDoc) {
      // 404 code is used because it's not processed by the custom exception handler
      throw new HttpException('Unknown token', 404);
    }

    // to keep in consistency with 'isIntegrationUser' property
    const isIntegrationSnapshot = !snapshotDoc.userId;

    if (isIntegrationSnapshot) {
      this.checkSnapshotIframeExpiration(snapshotDoc);
    } else {
      this.checkLocationExpiration(snapshotDoc);
    }

    snapshotDoc.lastAccess = new Date();
    snapshotDoc.visitAmount = snapshotDoc.visitAmount + 1;

    return snapshotDoc.save();
  }

  async updateSnapshot(
    user: UserDocument | TIntegrationUserDocument,
    id: string,
    { snapshot, config }: ApiUpdateSearchResultSnapshot,
  ): Promise<SearchResultSnapshotDocument> {
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

    const snapshotDoc: SearchResultSnapshotDocument =
      await this.fetchSnapshotById(user, id);

    Object.assign(snapshotDoc, { snapshot, config });

    return snapshotDoc.save();
  }

  async updateSnapshotDescription(
    user: UserDocument,
    id: string,
    description: string,
  ): Promise<SearchResultSnapshotDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.htmlSnippet &&
        !subscriptionPlan.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const snapshotDoc: SearchResultSnapshotDocument =
      await this.fetchSnapshotById(user, id);

    snapshotDoc.description = description;

    return snapshotDoc.save();
  }

  async deleteSnapshot(user: UserDocument, id: string): Promise<void> {
    await this.searchResultSnapshotModel.deleteOne({
      _id: id,
      userId: user.id,
    });
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

  async fetchSnapshots(
    user: UserDocument | TIntegrationUserDocument,
    skip = 0,
    limit = 0,
    includedFields?: IApiMongoParams,
    sortOptions?: IApiMongoParams,
    filter?: { [p: string]: unknown },
  ): Promise<SearchResultSnapshotDocument[]> {
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

    const filterQuery = filter || { userId: user.id };

    return this.searchResultSnapshotModel
      .find(filterQuery, includedFields)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  async fetchSnapshotById(
    user: UserDocument | TIntegrationUserDocument,
    id: string,
  ): Promise<SearchResultSnapshotDocument> {
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

    const filter = {
      _id: id,
    };

    Object.assign(
      filter,
      isIntegrationUser
        ? { 'integrationParams.integrationUserId': user.integrationUserId }
        : { userId: user.id },
    );

    const snapshotDoc = await this.searchResultSnapshotModel.findOne(filter);

    if (!snapshotDoc) {
      throw new HttpException('Unknown snapshot id', 400);
    }

    if (!isIntegrationUser) {
      this.checkLocationExpiration(snapshotDoc);
    }

    return snapshotDoc;
  }

  // only used in the InjectUserEmailRoutingInterceptor
  async fetchSnapshotByToken(
    token: string,
  ): Promise<SearchResultSnapshotDocument> {
    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      token,
    });

    if (!snapshotDoc) {
      throw new HttpException('Unknown token', 400);
    }

    // to keep in consistency with 'isIntegrationUser' property
    const isIntegrationSnapshot = !snapshotDoc.userId;

    if (!isIntegrationSnapshot) {
      this.checkLocationExpiration(snapshotDoc);
    }

    return snapshotDoc;
  }

  private checkLocationExpiration(
    location: LocationSearchDocument | SearchResultSnapshotDocument,
  ): void {
    const isLocationExpired = location.endsAt
      ? dayjs().isAfter(location.endsAt)
      : false;

    if (isLocationExpired) {
      throw new HttpException(addressExpiredMessage, 402);
    }
  }

  private checkSnapshotIframeExpiration(
    snapshotDoc: SearchResultSnapshotDocument,
  ): void {
    const isSnapshotIframeExpired = snapshotDoc.iframeEndsAt
      ? dayjs().isAfter(snapshotDoc.iframeEndsAt)
      : true;

    if (isSnapshotIframeExpired) {
      throw new HttpException(addressExpiredMessage, 402);
    }
  }

  async prolongAddressDuration(
    modelName: LimitIncreaseModelNameEnum,
    modelId: string,
    { value, unit }: IApiSubscriptionLimitAmount,
  ) {
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
        break;
      }
    }
  }

  async fetchOpenAiLocationDescription(
    user: UserDocument | TIntegrationUserDocument,
    locationDescriptionQuery: IApiOpenAiLocationDescriptionQuery,
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

    const searchResultSnapshot = await this.fetchSnapshotById(
      user,
      locationDescriptionQuery.searchResultSnapshotId,
    );

    const queryText = this.openAiService.getLocationDescriptionQuery({
      snapshot: searchResultSnapshot.snapshot,
      meanOfTransportation: locationDescriptionQuery.meanOfTransportation,
      tonality: openAiTonalities[locationDescriptionQuery.tonality],
      customText: locationDescriptionQuery.customText?.text,
    });

    return this.openAiService.fetchResponse(queryText);
  }

  async fetchOpenAiLocRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      searchResultSnapshotId,
      meanOfTransportation,
      tonality,
      customText,
      realEstateListingId,
      integrationId,
    }: IApiOpenAiLocationRealEstateDescriptionQuery,
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

    const searchResultSnapshot = await this.fetchSnapshotById(
      user,
      searchResultSnapshotId,
    );

    const realEstateListing =
      await this.realEstateListingService.fetchRealEstateListingById(
        user,
        realEstateListingId,
        integrationId,
      );

    if (!searchResultSnapshot || !realEstateListing) {
      throw new HttpException('Unknown snapshot or real estate id', 400);
    }

    const queryText = this.openAiService.getLocationRealEstateDescriptionQuery({
      realEstateListing,
      snapshot: searchResultSnapshot.snapshot,
      meanOfTransportation: meanOfTransportation,
      tonality: openAiTonalities[tonality],
      customText: customText?.text,
    });

    return this.openAiService.fetchResponse(queryText);
  }
}

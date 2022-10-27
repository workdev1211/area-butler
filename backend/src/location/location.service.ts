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
import ApiSearchDto from '../dto/api-search.dto';
import {
  ApiIsochrone,
  ApiOsmEntityCategory,
  ApiOsmLocation,
  ApiSearch,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  IApiMongoParams,
  MeansOfTransportation,
  OsmName,
  OsmType,
  TransportationParam,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import ApiUserRequestsDto from '../dto/api-user-requests.dto';
import ApiUpdateSearchResultSnapshotDto from '../dto/api-update-search-result-snapshot.dto';
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

@Injectable()
export class LocationService {
  constructor(
    private overpassService: OverpassService,
    private isochroneService: IsochroneService,
    @InjectModel(LocationSearch.name)
    private locationSearchModel: Model<LocationSearchDocument>,
    @InjectModel(SearchResultSnapshot.name)
    private searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private overpassDataService: OverpassDataService,
  ) {}

  async searchLocation(
    user: UserDocument,
    search: ApiSearch,
  ): Promise<ApiSearchResponse> {
    const existingLocation = await this.locationSearchModel.findOne(
      {
        userId: user.id,
        'locationSearch.coordinates': search.coordinates,
      },
      { endsAt: 1 },
      { sort: { createdAt: -1 } },
    );

    this.checkAddressExpiration(existingLocation);

    if (!existingLocation) {
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

    // TODO think about changing to Promise.all
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
      userId: user.id,
      locationSearch: search,
      isTrial: user.subscription.type === ApiSubscriptionPlanType.TRIAL,
    };

    if (!existingLocation) {
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
    } else {
      Object.assign(location, { endsAt: existingLocation.endsAt });
    }

    // TODO ask Kai what is the purpose of saving a new locationSearch record after each search request
    await new this.locationSearchModel(location).save();

    if (!existingLocation) {
      await this.userService.incrementExecutedRequestCount(user);
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

  async latestUserRequests(user: UserDocument): Promise<ApiUserRequestsDto> {
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
      (request: ApiSearchDto) =>
        `${request.coordinates.lat}${request.coordinates.lng}`,
    );

    return {
      requests: Object.values(grouped).map((g) => g[0]),
    };
  }

  async createSnapshot(
    user: UserDocument,
    snapshot: ApiSearchResultSnapshot,
    config: ApiSearchResultSnapshotConfig = {
      showLocation: true,
      showAddress: true,
      groupItems: true,
      showStreetViewLink: true,
    },
  ): Promise<ApiSearchResultSnapshotResponse> {
    const token = randomBytes(60).toString('hex');
    const { mapboxAccessToken } =
      await this.userService.createMapboxAccessToken(user);

    const snapshotDoc = {
      userId: user.id,
      token,
      mapboxAccessToken,
      snapshot,
      config,
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
      config,
      mapboxToken: mapboxAccessToken,
      createdAt: savedSnapshotDoc.createdAt,
      endsAt: savedSnapshotDoc.endsAt,
    };
  }

  async fetchEmbeddedMap(token: string): Promise<SearchResultSnapshotDocument> {
    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      token,
    });

    if (!snapshotDoc) {
      throw new HttpException('Unknown token', 404);
    }

    this.checkAddressExpiration(snapshotDoc);

    snapshotDoc.lastAccess = new Date();
    snapshotDoc.visitAmount = snapshotDoc.visitAmount + 1;

    return snapshotDoc.save();
  }

  async updateSnapshot(
    user: UserDocument,
    id: string,
    { snapshot, config }: ApiUpdateSearchResultSnapshotDto,
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
    user: UserDocument,
    skip = 0,
    limit = 0,
    includedFields?: IApiMongoParams,
    sortOptions?: IApiMongoParams,
    filter?: { [p: string]: unknown },
  ): Promise<SearchResultSnapshotDocument[]> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.htmlSnippet &&
        !subscriptionPlan.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const filterQuery = filter || { userId: user.id };

    return this.searchResultSnapshotModel
      .find(filterQuery, includedFields)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  async fetchSnapshotById(
    user: UserDocument,
    id: string,
  ): Promise<SearchResultSnapshotDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.htmlSnippet &&
        !subscriptionPlan.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      _id: id,
      userId: user.id,
    });

    if (!snapshotDoc) {
      throw new HttpException('Unknown snapshot id', 404);
    }

    this.checkAddressExpiration(snapshotDoc);

    return snapshotDoc;
  }

  // only used in the InjectUserEmailInterceptor
  async fetchSnapshotByToken(
    token: string,
  ): Promise<SearchResultSnapshotDocument> {
    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      token,
    });

    if (!snapshotDoc) {
      throw new HttpException('Unknown token', 404);
    }

    this.checkAddressExpiration(snapshotDoc);

    return snapshotDoc;
  }

  private checkAddressExpiration(
    address: LocationSearchDocument | SearchResultSnapshotDocument,
  ): void {
    if (dayjs().isAfter(address?.endsAt)) {
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
}

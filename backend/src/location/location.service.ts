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
import ApiSearchResponseDto from '../dto/api-search-response.dto';
import ApiSearchDto from '../dto/api-search.dto';
import TransportationParamDto from '../dto/transportation-param.dto';
import {
  ApiOsmEntityCategory,
  MeansOfTransportation,
  OsmName,
  OsmType,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import ApiOsmLocationDto from '../dto/api-osm-location.dto';
import ApiIsochroneDto from '../dto/api-isochrone.dto';
import ApiUserRequestsDto from '../dto/api-user-requests.dto';
import ApiSearchResultSnapshotDto from '../dto/api-search-result-snapshot.dto';
import ApiSearchResultSnapshotResponseDto from '../dto/api-search-result-snapshot-response.dto';
import ApiSearchResultSnapshotConfigDto from '../dto/api-search-result-snapshot-config.dto';
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
    search: ApiSearchDto,
  ): Promise<ApiSearchResponseDto> {
    const existingLocation = await this.locationSearchModel.findOne(
      {
        userId: user._id,
        'locationSearch.coordinates': search.coordinates,
      },
      { endsAt: 1 },
    );

    this.checkAddressExpiration(existingLocation);

    if (!existingLocation) {
      // TODO change map and reduce to reduce only
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        () =>
          user.requestsExecuted + 1 >
          retrieveTotalRequestContingent(user)
            .map((c) => c.amount)
            .reduce((acc, inc) => acc + inc),
        'Im aktuellen Monat sind keine weiteren Abfragen möglich',
      );
    }

    const coordinates = search.coordinates;
    const preferredAmenities = search.preferredAmenities;
    const routingProfiles = {};

    function deriveMeterEquivalent(routingProfile: TransportationParamDto) {
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
        : await this.overpassService.fetchEntites(
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
      userId: user._id,
      locationSearch: search,
    };

    if (!existingLocation) {
      const addressExpiration = this.subscriptionService.getLimitAmount(
        user.subscription.stripePriceId,
        ApiSubscriptionLimitsEnum.AddressExpiration,
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

    // TODO ask Kai what is the purpose of saving a new locationSearch record after each search request
    await new this.locationSearchModel(location).save();

    if (!existingLocation) {
      await this.userService.incrementExecutedRequestCount(user.id);
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
        { locationsOfInterest: ApiOsmLocationDto[]; isochrone: ApiIsochroneDto }
      >,
    };
  }

  async latestUserRequests(user: UserDocument): Promise<ApiUserRequestsDto> {
    // TODO think about using class-transformer for mapping
    const requests = (
      await this.locationSearchModel
        .find({ userId: user._id }, { _id: 1, locationSearch: 1, endsAt: 1 })
        .sort({ createdAt: -1 })
    ).map(({ locationSearch, endsAt, _id: id }) => ({
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

  async createSearchResultSnapshot(
    user: UserDocument,
    snapshot: ApiSearchResultSnapshotDto,
  ): Promise<ApiSearchResultSnapshotResponseDto> {
    const token = randomBytes(60).toString('hex');
    const { mapboxAccessToken } =
      await this.userService.createMapboxAccessToken(user);

    const config: ApiSearchResultSnapshotConfigDto = {
      showLocation: true,
      showAddress: true,
      groupItems: true,
      showStreetViewLink: true,
    };

    const snapshotDoc = {
      userId: user.id,
      token,
      mapboxAccessToken,
      snapshot,
      config,
    };

    const addressExpiration = this.subscriptionService.getLimitAmount(
      user.subscription.stripePriceId,
      ApiSubscriptionLimitsEnum.AddressExpiration,
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
      mapboxToken: mapboxAccessToken,
      createdAt: savedSnapshotDoc.createdAt,
      endsAt: savedSnapshotDoc.endsAt,
    };
  }

  async fetchSearchResultSnapshot(
    token: string,
  ): Promise<SearchResultSnapshotDocument> {
    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      token,
    });

    if (!snapshotDoc) {
      throw new HttpException('Unknown token', 404);
    }

    this.checkAddressExpiration(snapshotDoc);

    snapshotDoc.lastAccess = new Date();
    snapshotDoc.save();

    return snapshotDoc;
  }

  async updateSearchResultSnapshot(
    user: UserDocument,
    id: string,
    { snapshot, config }: ApiUpdateSearchResultSnapshotDto,
  ): Promise<SearchResultSnapshotDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const snapshotDoc: SearchResultSnapshotDocument =
      await this.fetchEmbeddableMap(user, id);

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
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const snapshotDoc: SearchResultSnapshotDocument =
      await this.fetchEmbeddableMap(user, id);

    snapshotDoc.description = description;

    return snapshotDoc.save();
  }

  async deleteSearchResultSnapshot(user: UserDocument, id: string) {
    await this.searchResultSnapshotModel.deleteOne({
      _id: id,
      userId: user._id,
    });
  }

  async fetchEmbeddableMaps(
    user: UserDocument,
    skip = 0,
    limit = 0,
    includedFields?: { [key: string]: number },
    sortOptions?: { [key: string]: number },
  ): Promise<SearchResultSnapshotDocument[]> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    return this.searchResultSnapshotModel
      .find({ userId: user.id }, includedFields)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  async fetchEmbeddableMap(
    user: UserDocument,
    id: string,
  ): Promise<SearchResultSnapshotDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      _id: id,
      userId: user.id,
    });

    if (!snapshotDoc) {
      throw new HttpException('Unknown token', 404);
    }

    this.checkAddressExpiration(snapshotDoc);

    return snapshotDoc;
  }

  checkAddressExpiration(
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

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
import { UserDocument, retrieveTotalRequestContingent } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';

const crypto = require('crypto');
@Injectable()
export class LocationService {
  constructor(
    private overpassService: OverpassService,
    private isochroneService: IsochroneService,
    @InjectModel(LocationSearch.name)
    private locationModel: Model<LocationSearchDocument>,
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
    const newRequest =
      (await this.locationModel.count({
        userId: user._id,
        'locationSearch.coordinates': search.coordinates,
      })) === 0;

    if (newRequest) {
      await this.subscriptionService.checkSubscriptionViolation(
        user._id,
        (_) =>
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

      const withIsochrone = search.withIsochrone === false ? false : true;
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

    await new this.locationModel({
      userId: user._id,
      locationSearch: search,
    }).save();

    if (newRequest) {
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
    const requests = (
      await this.locationModel
        .find({ userId: user._id })
        .sort({ createdAt: -1 })
    ).map((d) => d.locationSearch);

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
    const token = crypto.randomBytes(60).toString('hex');
    const { mapboxAccessToken } =
      await this.userService.createMapboxAccessToken(user);

    const config: ApiSearchResultSnapshotConfigDto = {
      showLocation: true,
      showAddress: true,
      groupItems: true,
      showStreetViewLink: true
    };

    const doc = await new this.searchResultSnapshotModel({
      userId: user.id,
      token,
      mapboxAccessToken,
      snapshot,
      config,
    }).save();

    return {
      id: doc.id,
      token,
      snapshot,
      mapboxToken: mapboxAccessToken,
      createdAt: doc.createdAt,
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
      user._id,
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const snapshotDoc: SearchResultSnapshotDocument =
      await this.fetchEmbeddableMap(user, id);

    snapshotDoc.snapshot = snapshot;
    snapshotDoc.config = config;

    return await snapshotDoc.save();
  }

  async updateSnapshotDescription(
    user: UserDocument,
    id: string,
    description: string,
  ): Promise<SearchResultSnapshotDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user._id,
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const snapshotDoc: SearchResultSnapshotDocument =
      await this.fetchEmbeddableMap(user, id);

    snapshotDoc.description = description;
    return await snapshotDoc.save();
  }

  async deleteSearchResultSnapshot(user: UserDocument, id: string) {
    await this.searchResultSnapshotModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: user._id,
    });
  }

  async fetchEmbeddableMaps(
    user: UserDocument,
  ): Promise<SearchResultSnapshotDocument[]> {
    await this.subscriptionService.checkSubscriptionViolation(
      user._id,
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    return this.searchResultSnapshotModel.find({ userId: user.id });
  }

  async fetchEmbeddableMap(
    user: UserDocument,
    id: string,
  ): Promise<SearchResultSnapshotDocument> {
    await this.subscriptionService.checkSubscriptionViolation(
      user._id,
      (subscription) => !subscription.appFeatures.htmlSnippet,
      'Das HTML Snippet Feature ist im aktuellen Plan nicht verfügbar',
    );

    const oid = new Types.ObjectId(id);
    const snapshotDoc = await this.searchResultSnapshotModel.findOne({
      userId: user.id,
      _id: oid,
    });

    if (!snapshotDoc) {
      throw new HttpException('Unknown token', 404);
    }

    return snapshotDoc;
  }
}

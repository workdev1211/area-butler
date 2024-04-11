import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionFields, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';

import { SubscriptionService } from '../user/subscription.service';
import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import {
  ApiCreateSnapshotReq,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import { UserDocument } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import {
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlanType,
} from '@area-butler-types/subscription-plan';
import { defaultSnapshotConfig } from '../../../shared/constants/location';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { realEstateListingsTitle } from '../../../shared/constants/real-estate';
import { IntegrationUserService } from '../user/integration-user.service';
import { TApiMongoSortQuery } from '../shared/types/shared';
import { EntityRoute, EntityTransitRoute } from '@area-butler-types/routing';
import { RoutingService } from '../routing/routing.service';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly integrationUserService: IntegrationUserService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly routingService: RoutingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
  ) {}

  async createSnapshot(
    user: UserDocument | TIntegrationUserDocument,
    { integrationId, snapshot }: ApiCreateSnapshotReq,
    config?: ApiSearchResultSnapshotConfig,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const isIntegrationUser = 'integrationUserId' in user;
    const token = randomBytes(60).toString('hex');
    let mapboxAccessToken;

    if (isIntegrationUser) {
      mapboxAccessToken = (
        await this.integrationUserService.createMapboxAccessToken(user)
      ).config.mapboxAccessToken;
    }

    if (!isIntegrationUser) {
      mapboxAccessToken = (await this.userService.createMapboxAccessToken(user))
        .mapboxAccessToken;
    }

    const snapshotConfig = config
      ? { ...config }
      : await this.getSnapshotConfig(user);

    // because of the different transportation params in the new snapshot and the template one
    snapshotConfig.defaultActiveMeans = snapshot.transportationParams.map(
      ({ type }) => type,
    );

    const userColor = isIntegrationUser ? user.config.color : user.color;
    const userMapIcon = isIntegrationUser ? user.config.mapIcon : user.mapIcon;

    if (!snapshotConfig.primaryColor && userColor) {
      snapshotConfig.primaryColor = userColor;
    }

    if (!snapshotConfig.mapIcon && userMapIcon) {
      snapshotConfig.mapIcon = userMapIcon;
    }

    const realEstateListings = (
      await this.realEstateListingService.fetchRealEstateListings(user)
    ).map((realEstate) =>
      mapRealEstateListingToApiRealEstateListing(user, realEstate),
    );

    const isRealEstatesHidden =
      realEstateListings.length &&
      (!snapshotConfig.defaultActiveGroups ||
        (snapshotConfig.defaultActiveGroups &&
          !snapshotConfig.defaultActiveGroups.includes(
            realEstateListingsTitle,
          )));

    if (isRealEstatesHidden) {
      snapshotConfig.entityVisibility = [
        ...(snapshotConfig.entityVisibility || []),
        ...realEstateListings.map(({ id }) => ({
          id,
          osmName: OsmName.property,
          excluded: true,
        })),
      ];
    }

    await this.assignRoutes(snapshot);
    const createdAt = dayjs();

    const snapshotDoc: Partial<SearchResultSnapshotDocument> = {
      mapboxAccessToken,
      token,
      config: snapshotConfig,
      snapshot: {
        ...snapshot,
        realEstateListings,
      },
      createdAt: createdAt.toDate(),
    };

    if (isIntegrationUser) {
      snapshotDoc.integrationParams = {
        integrationId,
        integrationUserId: user.integrationUserId,
        integrationType: user.integrationType,
      };
    }

    if (!isIntegrationUser) {
      snapshotDoc.userId = user.id;

      if (user.subscription.type === ApiSubscriptionPlanType.TRIAL) {
        snapshotDoc.isTrial = true;
      }

      const addressExpiration = this.subscriptionService.getLimitAmount(
        user.subscription.stripePriceId,
        ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION,
      );

      if (addressExpiration) {
        const endsAt = createdAt
          .add(
            addressExpiration.value,
            addressExpiration.unit as ManipulateType,
          )
          .toDate();

        Object.assign(snapshotDoc, { createdAt, endsAt });
      }
    }

    const savedSnapshotDoc = await new this.searchResultSnapshotModel(
      snapshotDoc,
    ).save();

    return {
      id: savedSnapshotDoc.id,
      config: savedSnapshotDoc.config,
      createdAt: savedSnapshotDoc.createdAt,
      endsAt: savedSnapshotDoc.endsAt,
      mapboxAccessToken: savedSnapshotDoc.mapboxAccessToken,
      token: savedSnapshotDoc.token,
      snapshot: savedSnapshotDoc.snapshot,
    };
  }

  async fetchSnapshot({
    user,
    filterQuery,
    projectQuery,
    sortQuery,
  }: {
    user: UserDocument | TIntegrationUserDocument;
    filterQuery?: FilterQuery<SearchResultSnapshotDocument>;
    projectQuery?: ProjectionFields<SearchResultSnapshotDocument>;
    sortQuery?: TApiMongoSortQuery;
  }): Promise<SearchResultSnapshotDocument> {
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

    const resFilterQuery = filterQuery ? { ...filterQuery } : {};

    if (isIntegrationUser) {
      resFilterQuery['integrationParams.integrationUserId'] =
        user.integrationUserId;

      resFilterQuery['integrationParams.integrationType'] =
        user.integrationType;
    } else {
      resFilterQuery.userId = user.id;
    }

    return this.searchResultSnapshotModel
      .findOne(resFilterQuery, projectQuery)
      .sort(sortQuery);
  }

  private async getSnapshotConfig(
    user: UserDocument | TIntegrationUserDocument,
  ): Promise<ApiSearchResultSnapshotConfig> {
    const isIntegrationUser = 'integrationUserId' in user;

    const userTemplateId = isIntegrationUser
      ? user.config.templateSnapshotId
      : user.templateSnapshotId;

    const parentUserId = user.parentId;
    let parentUser;
    let parentTemplateId;
    let templateSnapshot: SearchResultSnapshotDocument;

    if (!userTemplateId && parentUserId) {
      parentUser = isIntegrationUser
        ? await this.integrationUserService.findByDbId(parentUserId, {
            integrationUserId: 1,
            integrationType: 1,
            'config.templateSnapshotId': 1,
          })
        : await this.userService.findById({
            userId: parentUserId,
            projectQuery: {
              templateSnapshotId: 1,
            },
          });

      if (parentUser) {
        if (!isIntegrationUser) {
          parentUser.subscription = user.subscription;
        }

        parentTemplateId = isIntegrationUser
          ? parentUser.config.templateSnapshotId
          : parentUser.templateSnapshotId;
      }
    }

    const templateSnapshotId = userTemplateId || parentTemplateId;

    if (templateSnapshotId) {
      templateSnapshot = await this.fetchSnapshot({
        user: userTemplateId ? user : parentUser,
        filterQuery: { _id: new Types.ObjectId(templateSnapshotId) },
        projectQuery: { config: 1 },
      });
    }

    if (!templateSnapshot) {
      templateSnapshot = await this.fetchSnapshot({
        user,
        projectQuery: { config: 1 },
        sortQuery: { updatedAt: -1 },
      });
    }

    return templateSnapshot?.config
      ? { ...templateSnapshot.config }
      : { ...defaultSnapshotConfig };
  }

  private async assignRoutes(snapshot: ApiSearchResultSnapshot): Promise<void> {
    if (!snapshot.preferredLocations?.length) {
      return;
    }

    const routes: EntityRoute[] = [];
    const transitRoutes: EntityTransitRoute[] = [];

    for (const preferredLocation of snapshot.preferredLocations) {
      const routesResult = await this.routingService.fetchRoutes({
        meansOfTransportation: Object.keys(
          snapshot.searchResponse.routingProfiles,
        ) as MeansOfTransportation[],
        origin: snapshot.location,
        destinations: [
          {
            title: preferredLocation.title,
            coordinates: preferredLocation.coordinates,
          },
        ],
      });

      routes.push({
        routes: routesResult[0].routes,
        title: routesResult[0].title,
        show: [],
        coordinates: preferredLocation.coordinates,
      });

      const transitRoutesResult = await this.routingService.fetchTransitRoutes({
        origin: snapshot.location,
        destinations: [
          {
            title: preferredLocation.title,
            coordinates: preferredLocation.coordinates,
          },
        ],
      });

      if (transitRoutesResult.length && transitRoutesResult[0].route) {
        transitRoutes.push({
          route: transitRoutesResult[0].route,
          title: transitRoutesResult[0].title,
          show: false,
          coordinates: preferredLocation.coordinates,
        });
      }
    }

    Object.assign(snapshot, { routes: routes, transitRoutes: transitRoutes }); // TODO 1
  }
}

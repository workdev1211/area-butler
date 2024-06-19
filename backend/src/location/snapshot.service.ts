import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  ApiUpdateSearchResultSnapshot,
  MeansOfTransportation,
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
import { IntegrationUserService } from '../user/integration-user.service';
import { EntityRoute, EntityTransitRoute } from '@area-butler-types/routing';
import { RoutingService } from '../routing/routing.service';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { PlaceService } from '../place/place.service';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';

interface ICreateSnapshotParams {
  snapshotReq: ApiCreateSnapshotReq;
  config?: Partial<ApiSearchResultSnapshotConfig>;
  externalId?: string;
  isCheckAllowedCountries?: boolean;
  primaryColor?: string;
}

@Injectable()
export class SnapshotService {
  constructor(
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly integrationUserService: IntegrationUserService,
    private readonly placeService: PlaceService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly realEstateListingService: RealEstateListingService,
    private readonly routingService: RoutingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
    private readonly fetchSnapshotService: FetchSnapshotService,
  ) {}

  async createSnapshot(
    user: UserDocument | TIntegrationUserDocument,
    {
      config,
      externalId,
      primaryColor,
      isCheckAllowedCountries = true,
      snapshotReq: { integrationId, realEstateId, snapshot },
    }: ICreateSnapshotParams,
  ): Promise<ApiSearchResultSnapshotResponse> {
    // allowedCountries
    if (isCheckAllowedCountries) {
      await this.placeService.fetchPlaceOrFail({
        user,
        location: snapshot.location,
      });
    }

    const isIntegrationUser = 'integrationUserId' in user;
    const addressToken = randomBytes(60).toString('hex');
    const unaddressToken = randomBytes(60).toString('hex');
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

    if (primaryColor) {
      snapshotConfig.primaryColor = primaryColor;
    }

    await this.assignRoutes(snapshot);
    const createdAt = dayjs();

    const snapshotDoc: Partial<SearchResultSnapshotDocument> = {
      addressToken,
      externalId,
      mapboxAccessToken,
      snapshot,
      unaddressToken,
      config: snapshotConfig,
      createdAt: createdAt.toDate(),
    };

    let resRealEstateId: string = realEstateId
      ? (
          await this.realEstateListingService.fetchById(user, realEstateId, {
            _id: 1,
          })
        )?.id
      : undefined;

    if (isIntegrationUser) {
      snapshotDoc.integrationParams = {
        integrationUserId: user.integrationUserId,
        integrationType: user.integrationType,
      };

      if (!resRealEstateId) {
        resRealEstateId = (
          await this.realEstateListingIntService.findOneByIntParams(
            {
              integrationId,
              integrationType: user.integrationType,
              integrationUserId: user.integrationUserId,
            },
            { _id: 1 },
          )
        )?.id;
      }
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

      if (!resRealEstateId) {
        resRealEstateId = (
          await this.realEstateListingService.fetchByLocation(
            user,
            {
              address: snapshot.placesLocation.label,
              coordinates: snapshot.location,
            },
            { _id: 1 },
          )
        )?.id;
      }
    }

    if (resRealEstateId) {
      snapshotDoc.snapshot.realEstate = resRealEstateId;
    }

    const savedSnapshotDoc = await new this.searchResultSnapshotModel(
      snapshotDoc,
    ).save();

    return {
      addressToken: savedSnapshotDoc.addressToken,
      config: savedSnapshotDoc.config,
      createdAt: savedSnapshotDoc.createdAt,
      endsAt: savedSnapshotDoc.endsAt,
      externalId: savedSnapshotDoc.externalId,
      id: savedSnapshotDoc.id,
      mapboxAccessToken: savedSnapshotDoc.mapboxAccessToken,
      snapshot: savedSnapshotDoc.snapshot,
      unaddressToken: savedSnapshotDoc.unaddressToken,
    };
  }

  async duplicateSnapshot(
    user: UserDocument | TIntegrationUserDocument,
    snapshotId: string,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const snapshotDoc = await this.fetchSnapshotService.fetchSnapshotDoc(user, {
      filterQuery: { _id: new Types.ObjectId(snapshotId) },
    });

    if (!snapshotDoc) {
      throw new HttpException('Snapshot not found!', 400);
    }

    const snapshotDocObj = snapshotDoc.toObject();
    delete snapshotDocObj._id;
    delete snapshotDocObj.lastAccess;
    delete snapshotDocObj.updatedAt;
    snapshotDocObj.createdAt = new Date();
    snapshotDocObj.token = randomBytes(60).toString('hex');
    snapshotDocObj.visitAmount = 0;

    return this.fetchSnapshotService.getSnapshotRes(user, {
      snapshotDoc: await new this.searchResultSnapshotModel(
        snapshotDocObj,
      ).save(),
    });
  }

  async updateSnapshot(
    user: UserDocument | TIntegrationUserDocument,
    snapshotId: string,
    {
      config,
      customPois,
      description,
      snapshot,
    }: ApiUpdateSearchResultSnapshot,
  ): Promise<ApiSearchResultSnapshotResponse> {
    // allowedCountries
    if (snapshot?.location) {
      await this.placeService.fetchPlaceOrFail({
        user,
        location: snapshot.location,
      });
    }

    const snapshotDoc = await this.fetchSnapshotService.fetchSnapshotDoc(user, {
      filterQuery: { _id: new Types.ObjectId(snapshotId) },
    });

    if (!snapshotDoc) {
      throw new HttpException('Snapshot not found!', 400);
    }

    if (!config && !customPois && !description && !snapshot) {
      return this.fetchSnapshotService.getSnapshotRes(user, { snapshotDoc });
    }

    if (snapshot) {
      snapshotDoc.set('snapshot', snapshot);
    }

    if (config) {
      snapshotDoc.set('config', config);
    }

    if (description) {
      snapshotDoc.description = description;
    }

    if (customPois) {
      Object.values(MeansOfTransportation).forEach((transportParam) => {
        snapshotDoc.snapshot.searchResponse.routingProfiles[
          transportParam
        ]?.locationsOfInterest.push(...customPois);
      });

      snapshotDoc.markModified('snapshot.searchResponse.routingProfiles');
    }

    return this.fetchSnapshotService.getSnapshotRes(user, {
      snapshotDoc: await snapshotDoc.save(),
    });
  }

  async deleteSnapshot(
    user: UserDocument | TIntegrationUserDocument,
    snapshotId: string,
  ): Promise<void> {
    const filterQuery = await this.fetchSnapshotService.getFilterQueryWithUser(
      user,
      {
        _id: new Types.ObjectId(snapshotId),
      },
      false,
    );

    const isIntegrationUser = 'integrationUserId' in user;
    const templateSnapshotId = isIntegrationUser
      ? user.config.templateSnapshotId
      : user.templateSnapshotId;

    if (templateSnapshotId === snapshotId) {
      user.set(
        isIntegrationUser ? 'config.templateSnapshotId' : 'templateSnapshotId',
        undefined,
      );

      await user.save();
    }

    await this.searchResultSnapshotModel.deleteOne(filterQuery);
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
    let templateSnapshot: ApiSearchResultSnapshotResponse;

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
      templateSnapshot = await this.fetchSnapshotService.fetchSnapshot(
        userTemplateId ? user : parentUser,
        {
          filterQuery: { _id: new Types.ObjectId(templateSnapshotId) },
          projectQuery: { config: 1 },
          isFetchRealEstate: false,
        },
      );
    }

    if (!templateSnapshot) {
      templateSnapshot = await this.fetchSnapshotService.fetchSnapshot(user, {
        projectQuery: { config: 1 },
        sortQuery: { updatedAt: -1 },
        isFetchRealEstate: false,
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

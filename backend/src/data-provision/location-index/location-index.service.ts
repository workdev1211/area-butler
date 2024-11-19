import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { ApiDataSource } from '@area-butler-types/subscription-plan';
import { UserDocument } from '../../user/schema/user.schema';
import { SubscriptionService } from '../../user/subscription.service';
import {
  LocationIndex,
  LocationIndexDocument,
} from '../schemas/location-index.schema';
import { IApiLocIndexFeature } from '@area-butler-types/location-index';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { ApiGeometry } from '@area-butler-types/types';

@Injectable()
export class LocationIndexService {
  private readonly logger = new Logger(LocationIndexService.name);

  constructor(
    @InjectModel(LocationIndex.name)
    private readonly locationIndexModel: Model<LocationIndexDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createCollection(
    locationIndexFeatures: IApiLocIndexFeature[],
  ): Promise<void> {
    const collection = this.connection.db.collection(
      this.locationIndexModel.collection.name,
    );

    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${locationIndexFeatures.length}]`,
    );

    try {
      this.logger.log('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    this.logger.log(
      `Inserting ${locationIndexFeatures.length} location indices data`,
    );

    await collection.insertMany(locationIndexFeatures);

    this.logger.log('creating index on geometry field');
    await collection.createIndex({ geometry: '2dsphere' });
    this.logger.log(`${collection.collectionName} created`);

    return;
  }

  async queryWithUser(
    user: UserDocument | TIntegrationUserDocument,
    queryData: ApiGeometry,
  ): Promise<LocationIndexDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      this.subscriptionService.checkSubscriptionViolation(
        user.subscription?.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.dataSources?.includes(
            ApiDataSource.LOCATION_INDICES,
          ) &&
          !subscriptionPlan?.appFeatures.dataSources.includes(
            ApiDataSource.LOCATION_INDICES,
          ),
        'Lageindizes sind im aktuellem Abonnement nicht verfügbar',
      );
    }

    return this.query(queryData);
  }

  async query({
    type,
    coordinates,
  }: ApiGeometry): Promise<LocationIndexDocument[]> {
    return this.locationIndexModel.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type,
            coordinates,
          },
        },
      },
    });
  }
}

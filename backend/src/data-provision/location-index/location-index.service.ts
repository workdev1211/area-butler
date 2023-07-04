import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { ApiDataSource } from '@area-butler-types/subscription-plan';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { UserDocument } from '../../user/schema/user.schema';
import { SubscriptionService } from '../../user/subscription.service';
import {
  LocationIndex,
  LocationIndexDocument,
} from '../schemas/location-index.schema';
import { IApiLocationIndexFeature } from '@area-butler-types/location-index';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';

@Injectable()
export class LocationIndexService {
  private readonly logger = new Logger(LocationIndexService.name);

  constructor(
    @InjectModel(LocationIndex.name)
    private readonly locationIndexModel: Model<LocationIndexDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createCollection(locationIndexFeatures: IApiLocationIndexFeature[]) {
    const collection = this.connection.db.collection(
      this.locationIndexModel.collection.name,
    );

    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${locationIndexFeatures.length}]`,
    );

    try {
      this.logger.debug('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    this.logger.debug(
      `Inserting ${locationIndexFeatures.length} location indices data`,
    );

    await collection.insertMany(locationIndexFeatures);

    this.logger.log('creating index on geometry field');
    await collection.createIndex({ geometry: '2dsphere' });
    this.logger.log(`${collection.collectionName} created`);

    return;
  }

  async findIntersecting(
    user: UserDocument | TIntegrationUserDocument,
    { type, coordinates }: ApiGeometryDto,
  ): Promise<LocationIndexDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
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

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { ApiFederalElectionFeature } from '@area-butler-types/federal-election';
import { ApiDataSource } from '@area-butler-types/subscription-plan';
import {
  FederalElection,
  FederalElectionDocument,
} from '../schemas/federal-election.schema';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { UserDocument } from '../../user/schema/user.schema';
import { SubscriptionService } from '../../user/subscription.service';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';

export const distinctValues = (value: any, index: any, self: any) =>
  self.map((i: any) => JSON.stringify(i)).indexOf(JSON.stringify(value)) ===
  index;

@Injectable()
export class FederalElectionService {
  private readonly logger = new Logger(FederalElectionService.name);

  constructor(
    @InjectModel(FederalElection.name)
    private readonly federalElectionModel: Model<FederalElectionDocument>,
    @InjectConnection() private connection: Connection,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createCollection(federalElectionFeatures: ApiFederalElectionFeature[]) {
    const collection = this.connection.db.collection(
      this.federalElectionModel.collection.name,
    );

    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${federalElectionFeatures.length}]`,
    );

    const augsburg = federalElectionFeatures.find(
      (f) => f.properties.WKR_NR === 253,
    );

    augsburg.geometry.coordinates[0] =
      augsburg.geometry.coordinates[0].filter(distinctValues);

    try {
      this.logger.log('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    this.logger.log(
      `Inserting ${federalElectionFeatures.length} federal election districts`,
    );

    await collection.insertMany(
      federalElectionFeatures.filter((f) => f.properties.WKR_NR !== 253),
    ); // can't deal with augsburg

    this.logger.log('creating index on geometry field');
    await collection.createIndex({ geometry: '2dsphere' });
    this.logger.log(`${collection.collectionName} created`);

    return;
  }

  async findIntersecting(
    user: UserDocument | TIntegrationUserDocument,
    query: ApiGeometryDto,
  ): Promise<FederalElectionDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.dataSources?.includes(
            ApiDataSource.FEDERAL_ELECTION,
          ) &&
          !subscriptionPlan?.appFeatures.dataSources.includes(
            ApiDataSource.FEDERAL_ELECTION,
          ),
        'Bundestagswahldaten sind im aktuellem Abonnement nicht verfügbar',
      );
    }

    return this.federalElectionModel.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: query.type,
            coordinates: query.coordinates,
          },
        },
      },
    });
  }
}

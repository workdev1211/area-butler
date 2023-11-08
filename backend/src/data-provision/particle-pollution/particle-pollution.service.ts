import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import { ApiDataSource } from '@area-butler-types/subscription-plan';
import {
  ParticlePollution,
  ParticlePollutionDocument,
} from '../schemas/particle-pollution.schema';
import { ApiGeojsonFeature } from '@area-butler-types/types';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { SubscriptionService } from '../../user/subscription.service';
import { UserDocument } from '../../user/schema/user.schema';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { createChunks } from '../../../../shared/functions/shared.functions';

@Injectable()
export class ParticlePollutionService {
  private readonly logger = new Logger(ParticlePollutionService.name);

  constructor(
    @InjectModel(ParticlePollution.name)
    private readonly particlePollutionModel: Model<ParticlePollutionDocument>,
    @InjectConnection() private connection: Connection,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createCollection(particlePollutionFeatures: ApiGeojsonFeature[]) {
    const collection = this.connection.db.collection(
      this.particlePollutionModel.collection.name,
    );

    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${particlePollutionFeatures.length}]`,
    );

    const chunkSize = 1000;

    try {
      this.logger.log('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    const chunks = createChunks<ApiGeojsonFeature>(
      particlePollutionFeatures,
      chunkSize,
    );

    this.logger.log(
      `Inserting ${chunks.length} chunks of ${chunkSize} datasets.`,
    );

    await Promise.all(chunks.map(async (c) => await collection.insertMany(c)));
    this.logger.log('creating index on geometry field');
    await collection.createIndex({ geometry: '2dsphere' });
    this.logger.log(`${collection.collectionName} created`);

    return;
  }

  async findIntersecting(
    user: UserDocument | TIntegrationUserDocument,
    query: ApiGeometryDto,
  ): Promise<ParticlePollutionDocument[]> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      await this.subscriptionService.checkSubscriptionViolation(
        user.subscription.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.dataSources?.includes(
            ApiDataSource.PARTICLE_POLLUTION,
          ) &&
          !subscriptionPlan?.appFeatures.dataSources.includes(
            ApiDataSource.PARTICLE_POLLUTION,
          ),
        'Feinstaubdaten sind im aktuellem Abonnement nicht verfügbar',
      );
    }

    return this.particlePollutionModel.find({
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

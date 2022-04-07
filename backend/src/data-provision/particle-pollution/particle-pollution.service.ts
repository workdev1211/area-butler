import { ApiDataSource } from '@area-butler-types/subscription-plan';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  ParticlePollution,
  ParticlePollutionDocument,
} from '../schemas/particle-pollution.schema';
import { ApiGeojsonFeature } from '@area-butler-types/types';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { SubscriptionService } from '../../user/subscription.service';
import { UserDocument } from '../../user/schema/user.schema';

@Injectable()
export class ParticlePollutionService {
  private readonly logger = new Logger(ParticlePollutionService.name);

  constructor(
    @InjectModel(ParticlePollution.name)
    private particlePollutionModel: Model<ParticlePollutionDocument>,
    @InjectConnection() private connection: Connection,
    private subscriptionService: SubscriptionService,
  ) {}

  async createCollection(particlePollutionFeatures: ApiGeojsonFeature[]) {
    const collection = this.connection.db.collection(
      this.particlePollutionModel.collection.name,
    );
    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${particlePollutionFeatures.length}]`,
    );
    const chunksize = 1000;
    const createChunks = (a, size) =>
      Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
        a.slice(i * size, i * size + size),
      );

    try {
      this.logger.debug('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    const chunks = createChunks(particlePollutionFeatures, chunksize);

    this.logger.debug(
      `Inserting ${chunks.length} chunks of ${chunksize} datasets.`,
    );
    await Promise.all(chunks.map(async (c) => await collection.insertMany(c)));
    this.logger.log('creating index on geometry field');
    await collection.createIndex({ geometry: '2dsphere' });
    this.logger.log(`${collection.collectionName} created`);
    return;
  }

  async findIntersecting(query: ApiGeometryDto, user: UserDocument) {
    await this.subscriptionService.checkSubscriptionViolation(
      user._id,
      (subscription) =>
        !subscription?.appFeatures.dataSources.includes(
          ApiDataSource.PARTICLE_POLLUTION,
        ),
      'Feinstaubdaten sind im aktuellem Abonnement nicht verfügbar',
    );

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

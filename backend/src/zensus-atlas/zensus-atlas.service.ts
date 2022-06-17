import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Promise } from 'mongoose';

import { ZensusAtlas, ZensusAtlasDocument } from './schema/zensus-atlas.schema';
import { ApiGeojsonFeature } from '@area-butler-types/types';
import ApiGeometryDto from '../dto/api-geometry.dto';
import { ApiDataSource } from '@area-butler-types/subscription-plan';
import { UserDocument } from '../user/schema/user.schema';
import { SubscriptionService } from '../user/subscription.service';

@Injectable()
export class ZensusAtlasService {
  private readonly logger = new Logger(ZensusAtlasService.name);

  constructor(
    @InjectModel(ZensusAtlas.name)
    private zensusAtlasModel: Model<ZensusAtlasDocument>,
    @InjectConnection() private connection: Connection,
    private subscriptionService: SubscriptionService,
  ) {}

  async create(zensusAtlasFeature: ApiGeojsonFeature): Promise<ZensusAtlas> {
    const created = new this.zensusAtlasModel(zensusAtlasFeature);

    return created.save();
  }

  async createCollection(zensusAtlasFeatures: ApiGeojsonFeature[]) {
    const collection = this.connection.db.collection(
      this.zensusAtlasModel.collection.name,
    );

    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${zensusAtlasFeatures.length}]`,
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

    const chunks = createChunks(zensusAtlasFeatures, chunksize);

    this.logger.debug(
      `Inserting ${chunks.length} chunks of ${chunksize} datasets.`,
    );

    await Promise.all(chunks.map(async (c) => await collection.insertMany(c)));
    this.logger.log('creating index on geometry field');
    await collection.createIndex({ geometry: '2dsphere' });
    this.logger.log(`${collection.collectionName} created`);

    return;
  }

  findById(id) {
    return this.zensusAtlasModel.findById(id);
  }

  async findIntersecting(user: UserDocument, query: ApiGeometryDto) {
    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscription) =>
        !subscription?.appFeatures.dataSources.includes(ApiDataSource.CENSUS),
      'Der Zensus Atlas ist im aktuellem Abonnement nicht verfügbar',
    );

    return this.zensusAtlasModel.find({
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

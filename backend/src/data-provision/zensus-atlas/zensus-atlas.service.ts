import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Promise } from 'mongoose';

import {
  ZensusAtlas,
  ZensusAtlasDocument,
} from '../schemas/zensus-atlas.schema';
import { ApiGeojsonFeature, TApiDataProvision } from '@area-butler-types/types';
import ApiGeometryDto from '../../dto/api-geometry.dto';
import { ApiDataSource } from '@area-butler-types/subscription-plan';
import { UserDocument } from '../../user/schema/user.schema';
import { SubscriptionService } from '../../user/subscription.service';
import {
  ZipLevelData,
  ZipLevelDataDocument,
} from '../schemas/zip-level-data.schema';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { createChunks } from '../../../../shared/functions/shared.functions';

@Injectable()
export class ZensusAtlasService {
  private readonly logger = new Logger(ZensusAtlasService.name);

  constructor(
    @InjectModel(ZensusAtlas.name)
    private readonly zensusAtlasModel: Model<ZensusAtlasDocument>,
    @InjectModel(ZipLevelData.name)
    private readonly zipLevelDataModel: Model<ZipLevelDataDocument>,
    @InjectConnection() private connection: Connection,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async create(zensusAtlasFeature: ApiGeojsonFeature): Promise<ZensusAtlas> {
    return new this.zensusAtlasModel(zensusAtlasFeature).save();
  }

  async createCollection(zensusAtlasFeatures: ApiGeojsonFeature[]) {
    const collection = this.connection.db.collection(
      this.zensusAtlasModel.collection.name,
    );

    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${zensusAtlasFeatures.length}]`,
    );

    const chunkSize = 1000;

    try {
      this.logger.log('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    const chunks = createChunks<ApiGeojsonFeature>(
      zensusAtlasFeatures,
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

  findById(id) {
    return this.zensusAtlasModel.findById(id);
  }

  async query(
    user: UserDocument | TIntegrationUserDocument,
    query: ApiGeometryDto,
  ): Promise<TApiDataProvision> {
    const isIntegrationUser = 'integrationUserId' in user;

    if (!isIntegrationUser) {
      this.subscriptionService.checkSubscriptionViolation(
        user.subscription?.type,
        (subscriptionPlan) =>
          !user.subscription?.appFeatures?.dataSources?.includes(
            ApiDataSource.CENSUS,
          ) &&
          !subscriptionPlan?.appFeatures.dataSources.includes(
            ApiDataSource.CENSUS,
          ),
        'Der Zensus Atlas ist im aktuellem Abonnement nicht verfügbar',
      );
    }

    const addressData = (
      await this.zensusAtlasModel.find({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: query.type,
              coordinates: query.coordinates,
            },
          },
        },
      })
    ).map((d: any) => {
      if (d?.properties?.Frauen_A) {
        delete d?.properties?.Frauen_A;
      }

      return d.toObject();
    });

    const zipLevelData = (
      await this.zipLevelDataModel.find({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: query.type,
              coordinates: query.coordinates,
            },
          },
        },
      })
    ).map((d: any) => {
      const zensusProperties = Object.keys(d.properties).reduce(
        (result, propertyName) => {
          if (
            propertyName === 'plz' ||
            (propertyName.includes('[census]') &&
              propertyName !== '[census] Frauen_A')
          ) {
            result[propertyName.replace(/^\[census] (.*)/g, '$1')] =
              d.properties[propertyName];
          }

          return result;
        },
        {},
      );

      d.properties = { ...zensusProperties };

      return d.toObject();
    });

    return { addressData, zipLevelData };
  }
}

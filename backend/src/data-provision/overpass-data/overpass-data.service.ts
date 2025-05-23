import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Promise } from 'mongoose';
import { Cron } from '@nestjs/schedule';

import {
  OverpassData,
  OverpassDataDocument,
} from '../schemas/overpass-data.schema';
import { osmEntityTypes } from '../../../../shared/constants/osm-entity-types';
import { OverpassService } from '../../client/overpass/overpass.service';
import { ApiOsmLocation } from '@area-butler-types/types';
import { IApiOverpassFetchNodes } from '@area-butler-types/overpass';
import { configService } from '../../config/config.service';
import { createChunks } from '../../../../shared/functions/shared.functions';

@Injectable()
export class OverpassDataService {
  private readonly logger = new Logger(OverpassDataService.name);
  private readonly countries = configService.getOverpassCountries();

  constructor(
    @InjectModel(OverpassData.name)
    private readonly overpassDataModel: Model<OverpassDataDocument>,
    private readonly overpassService: OverpassService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  // 'name' is required in order to prevent the cron job duplication
  @Cron(
    configService.getSystemEnv() === 'prod' ? '0 0 23 * * 0-5' : '0 0 23 * * 6',
    { name: 'LoadOverpassData' },
  )
  async loadOverpassData(): Promise<void> {
    if (!configService.useOverpassDb()) {
      this.logger.log('The Overpass DB data is not used.');
      return;
    }

    const tempCollectionName = `${this.overpassDataModel.collection.name}_tmp`;
    this.logger.log('Loading overpass data into the database.');
    const tempCollection = this.connection.db.collection(tempCollectionName);
    this.logger.log(`Dropping existing ${tempCollectionName} collection.`);
    await tempCollection.drop().catch(() => undefined);
    const chunkSize = 1000;

    this.logger.log(
      `Fetching the Overpass data of ${this.countries.join(', ')}.`,
    );

    try {
      for (const et of osmEntityTypes) {
        for (const country of this.countries) {
          const feats = await this.overpassService.fetchByEntityType(
            et,
            country,
          );

          const chunks = createChunks<OverpassData>(feats, chunkSize);
          this.logger.verbose(
            `Starting ${et.name} (${feats.length}) import for ${country}.`,
          );

          if (feats.length) {
            for (const chunk of chunks) {
              await tempCollection.insertMany(chunk);
            }
          }
        }

        this.logger.log(`${et.name} import completed.`);
      }
    } catch (e) {
      this.logger.error(e);
      await tempCollection.drop().catch(() => undefined);
      throw new HttpException('Overpass import failed!', 400);
    }

    this.logger.log('Overpass data loaded.', 'Building overpass data index.');

    await tempCollection.createIndex({
      geometry: '2dsphere',
    });

    this.logger.log('Overpass index created.', 'Switching collections.');
    await this.overpassDataModel.collection.drop();

    await tempCollection.rename(
      this.overpassDataModel.collection.collectionName,
    );

    this.logger.log('New Overpass data is active.');
  }

  async findForCenterAndDistance({
    coordinates,
    distanceInMeters,
    preferredAmenities,
    limit = 0,
  }: IApiOverpassFetchNodes): Promise<ApiOsmLocation[]> {
    const dbQuery = {
      geometry: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat],
          },
          $maxDistance: distanceInMeters,
          $minDistance: 0,
        },
      },
      entityType: { $in: preferredAmenities },
    };

    const response = await this.overpassDataModel
      .find(dbQuery)
      .limit(limit)
      .lean();

    return this.overpassService.mapResponse(
      response,
      coordinates,
      preferredAmenities,
    );
  }
}

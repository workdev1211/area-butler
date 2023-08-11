import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Promise } from 'mongoose';
import { Cron } from '@nestjs/schedule';

import {
  OverpassData,
  OverpassDataDocument,
} from '../schemas/overpass-data.schema';
import { osmEntityTypes } from '../../../../shared/constants/constants';
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
    ['local', 'dev'].includes(configService.getSystemEnv())
      ? '0 0 2 * * 6'
      : '0 0 2 * * 0-5',
    { name: 'LoadOverpassData' },
  )
  async loadOverpassData(): Promise<void> {
    const tempCollectionName = `${this.overpassDataModel.collection.name}_tmp`;
    this.logger.log('Loading overpass data into the database.');
    const tempCollection = this.connection.db.collection(tempCollectionName);

    const chunkSize = 1000;

    try {
      this.logger.log(`Dropping existing ${tempCollectionName} collection.`);
      await tempCollection.drop();
    } catch (e) {}

    this.logger.log('Fetching the Overpass data.');

    try {
      for (const et of osmEntityTypes) {
        for (const country of this.countries) {
          const feats = await this.overpassService.fetchByEntityType(
            et,
            country,
          );

          const chunks = createChunks<OverpassData>(feats, chunkSize);
          this.logger.log(
            `Starting the bulkWrite ${et.name}[${feats.length}].`,
          );

          if (feats.length) {
            for (const chunk of chunks) {
              await tempCollection.insertMany(chunk);
            }
          }
        }

        this.logger.log(`The bulkWrite of ${et.name} finished.`);
      }
    } catch (e) {
      this.logger.error(e);
      await tempCollection.drop();
      throw new HttpException('Overpass import failed!', 400);
    }

    this.logger.log('Overpass data loaded.');
    this.logger.log('Building overpass data index.');

    await tempCollection.createIndex({
      geometry: '2dsphere',
    });

    this.logger.log('Overpass index created.');
    this.logger.log('Switching collections.');
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

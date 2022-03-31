import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Promise } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import {
  OverpassData,
  OverpassDataDocument,
} from '../schemas/overpass-data.schema';
import { osmEntityTypes } from '../../../../shared/constants/constants';
import { OverpassService } from '../../client/overpass/overpass.service';
import {
  ApiCoordinates,
  ApiOsmLocation,
  OsmName,
} from '@area-butler-types/types';

@Injectable()
export class OverpassDataService {
  private readonly logger = new Logger(OverpassDataService.name);
  constructor(
    @InjectModel(OverpassData.name)
    private overpassDataModel: Model<OverpassDataDocument>,
    private overpassService: OverpassService,
    @InjectConnection() private connection: Connection,
  ) {}

  @Cron('0 0 2 * * *')
  async loadOverpassData() {
    const tempCollectionName = `${this.overpassDataModel.collection.name}_tmp`;
    this.logger.log(`Loading overpass data into database`);
    const collection = this.connection.db.collection(tempCollectionName);
    this.logger.log(`creating new ${tempCollectionName} collection`);
    const chunksize = 1000;
    const createChunks = (a, size) =>
      Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
        a.slice(i * size, i * size + size),
      );

    try {
      this.logger.debug('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    this.logger.debug('fetchOverpassData called');
    for (const et of osmEntityTypes) {
      try {
        const feats = await this.overpassService.fetchForEntityType(et);
        const chunks = createChunks(feats, chunksize);

        this.logger.debug(`about to bulkWrite ${et.name}[${feats.length}]`);
        if (feats.length) {
          for (const chunk of chunks) {
            await collection.insertMany(chunk);
          }
        }
        this.logger.debug(`bulkWrite ${et.name} done`);
      } catch (e) {
        console.error(e);
      }
    }
    this.logger.log(`Overpass data loaded`);
    this.logger.log(`Building overpass data index`);
    await collection.createIndex({
      geometry: '2dsphere',
    });
    this.logger.log(`Overpass index created`);
    this.logger.log('Switching collection');
    await this.overpassDataModel.collection.drop();
    await collection.rename(this.overpassDataModel.collection.collectionName);
    this.logger.log('new overpass data active');
  }

  async findForCenterAndDistance(
    coordinates: ApiCoordinates,
    distanceInMeters: number,
    preferredAmenities: OsmName[],
  ): Promise<ApiOsmLocation[]> {
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
      entityType: { $in: Object.values(preferredAmenities) },
    };
    const response = await this.overpassDataModel.find(dbQuery).lean().exec();
    return this.overpassService.mapResponse(response, coordinates);
  }
}

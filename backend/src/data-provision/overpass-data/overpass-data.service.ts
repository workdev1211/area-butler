import { HttpService, Injectable, Logger } from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, Model} from 'mongoose';
import { configService } from 'src/config/config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  OverpassData,
  OverpassDataDocument,
} from '../schemas/overpass-data.schema';
import { osmEntityTypes } from '../../../../shared/constants/constants';
import * as QueryOverpass from 'query-overpass';

@Injectable()
export class OverpassDataService {
  private readonly logger = new Logger(OverpassDataService.name);
  constructor(
    @InjectModel(OverpassData.name)
    private overpassDataModel: Model<OverpassDataDocument>,
    private httpService: HttpService,
    @InjectConnection() private connection: Connection,
  ) {}

  @Cron('0 0 2 * * *')
  async loadOverpassData() {
    this.logger.log(`Loading overpass data into database`)
    try {
      await this.overpassDataModel.collection.dropIndex('geometry_index');
    } catch(e) {
      console.error(`could not drop index for overpass data: ${e.code}`)
    }
    this.logger.debug('fetchOverpassData called');
    for (const et of osmEntityTypes) {
      try {
        const feats = await this.fetchOverpassData(`node[${et.type}=${et.name}];out;`);
        const updateOne = feats.map(f => {
          return {
            replaceOne: {
              filter: {overpassId: f.properties.id},
              replacement: {...f },
              upsert: true
            },
          }
        })
        this.logger.debug(`about to bulkWrite ${et.type}[${feats.length}]`)
        await this.overpassDataModel.bulkWrite(updateOne, {raw: true, bypassDocumentValidation: true, ordered: false});
        this.logger.debug("bulkWrite done")
      } catch(e) {
        console.error(e)
      }
    }
    this.logger.log(`Overpass data loaded`)
    this.logger.log(`Building overpass data index`)
    await this.overpassDataModel.collection.createIndex({
      geometry: '2dsphere',
    },{name: 'geometry_index'} );
    this.logger.log(`Overpass index created`)
  }

  fetchOverpassData(query): Promise<any[]> {
    return new Promise((resolve, reject) => {
      QueryOverpass(
        query,
        (error, data) => {
          if (error) {
            console.error(error);
            reject();
          } else {
            console.log(`data fetched: ${data.features.length}`);
            resolve(data.features);
          }
        },
        {
          overpassUrl: configService.getOverpassUrl(),
        },
      );
    });
  }

  async writeToTb(features) {
    try {
      this.logger.debug(`inserting ${features.length} features into database`)
      return await this.overpassDataModel.insertMany(features,{lean: true, limit: 100, rawResult: true});
    } catch (e) {
      this.logger.error(e);
    }
  }
}

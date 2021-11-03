import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  FederalElection,
  FederalElectionDocument,
} from '../schemas/federal-election.schema';
import { FederalElectionFeature } from './federal-election.types';

export const distinctValues = (value: any, index: any, self: any) =>
  self.map((i: any) => JSON.stringify(i)).indexOf(JSON.stringify(value)) === index;

@Injectable()
export class FederalElectionService {
  private readonly logger = new Logger(FederalElectionService.name);

  constructor(
    @InjectModel(FederalElection.name)
    private federalElectionModel: Model<FederalElectionDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async createCollection(federalElectionFeatures: FederalElectionFeature[]) {

    const collection = this.connection.db.collection(
      this.federalElectionModel.collection.name,
    );
    this.logger.log(
      `creating new ${collection.collectionName} collection [count: ${federalElectionFeatures.length}]`,
    );

    const augsburg = federalElectionFeatures.find(f => f.properties.WKR_NR === 253);
    augsburg.geometry.coordinates[0] = augsburg.geometry.coordinates[0].filter(distinctValues);

    try {
      this.logger.debug('Dropping existing collection');
      await collection.drop();
    } catch (e) {}

    this.logger.debug(
      `Inserting ${federalElectionFeatures.length} federal election districts`,
    );
    await collection.insertMany(federalElectionFeatures.filter(f => f.properties.WKR_NR !== 253)); // cant deal with augsburg
    this.logger.log('creating index on geometry field');
    await collection.createIndex({ geometry: '2dsphere' });
    this.logger.log(`${collection.collectionName} created`);
    return;
  }
}

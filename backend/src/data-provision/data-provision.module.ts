import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

import { ClientModule } from '../client/client.module';
import { DataProvisionController } from './data-provision.controller';
import { FederalElectionController } from './federal-election/federal-election.controller';
import { FederalElectionService } from './federal-election/federal-election.service';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import { ParticlePollutionController } from './particle-pollution/particle-pollution.controller';
import { ParticlePollutionService } from './particle-pollution/particle-pollution.service';
import {
  FederalElection,
  FederalElectionSchema,
} from './schemas/federal-election.schema';
import {
  OverpassData,
  OverpassDataSchema,
} from './schemas/overpass-data.schema';
import {
  ParticlePollution,
  ParticlePollutionSchema,
} from './schemas/particle-pollution.schema';
import { UserModule } from '../user/user.module';
import { LocationIndexService } from './location-index/location-index.service';
import {
  LocationIndex,
  LocationIndexSchema,
} from './schemas/location-index.schema';
import { LocationIndexController } from './location-index/location-index.controller';
import { FederalElectionIntController } from './federal-election/federal-election-int.controller';
import { ParticlePollutionIntController } from './particle-pollution/particle-pollution-int.controller';
import { LocationIndexIntController } from './location-index/location-index-int.controller';
import { LocationIndexExtController } from './location-index/location-index-ext.controller';

@Module({
  providers: [
    OverpassDataService,
    FederalElectionService,
    ParticlePollutionService,
    LocationIndexService,
  ],
  controllers: [
    DataProvisionController,
    FederalElectionController,
    ParticlePollutionController,
    LocationIndexController,
    FederalElectionIntController,
    ParticlePollutionIntController,
    LocationIndexIntController,
    LocationIndexExtController,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: OverpassData.name, schema: OverpassDataSchema },
      { name: FederalElection.name, schema: FederalElectionSchema },
      { name: ParticlePollution.name, schema: ParticlePollutionSchema },
      { name: LocationIndex.name, schema: LocationIndexSchema },
    ]),
    HttpModule,
    ClientModule,
    UserModule,
  ],
  exports: [OverpassDataService],
})
export class DataProvisionModule {}

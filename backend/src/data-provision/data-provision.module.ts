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
import { ZensusAtlasService } from './zensus-atlas/zensus-atlas.service';
import { ZensusAtlas, ZensusAtlasSchema } from './schemas/zensus-atlas.schema';
import {
  ZipLevelData,
  ZipLevelDataSchema,
} from './schemas/zip-level-data.schema';
import { ZensusAtlasController } from './zensus-atlas/zensus-atlas.controller';
import { ZensusAtlasIntController } from './zensus-atlas/zensus-atlas-int.controller';
import { ZensusAtlasExtController } from './zensus-atlas/zensus-atlas-ext.controller';
import { PlaceModule } from '../place/place.module';

// TODO refactor all modules and their relations based on this one
@Module({
  imports: [
    ClientModule,
    HttpModule,
    PlaceModule,
    UserModule,
    MongooseModule.forFeature([
      { name: OverpassData.name, schema: OverpassDataSchema },
      { name: FederalElection.name, schema: FederalElectionSchema },
      { name: LocationIndex.name, schema: LocationIndexSchema },
      { name: ParticlePollution.name, schema: ParticlePollutionSchema },
      { name: ZensusAtlas.name, schema: ZensusAtlasSchema },
      { name: ZipLevelData.name, schema: ZipLevelDataSchema },
    ]),
  ],
  controllers: [
    DataProvisionController,
    FederalElectionController,
    FederalElectionIntController,
    LocationIndexController,
    LocationIndexIntController,
    LocationIndexExtController,
    ParticlePollutionController,
    ParticlePollutionIntController,
    ZensusAtlasController,
    ZensusAtlasIntController,
    ZensusAtlasExtController,
  ],
  providers: [
    OverpassDataService,
    FederalElectionService,
    LocationIndexService,
    ParticlePollutionService,
    ZensusAtlasService,
  ],
  exports: [
    OverpassDataService,
    LocationIndexService,
    ZensusAtlasService,
    MongooseModule,
  ],
})
export class DataProvisionModule {}

import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { ClientModule } from '../client/client.module';
import { DataProvisionController } from "./data-provision.controller";
import { FederalElectionController } from './federal-election/federal-election.controller';
import { FederalElectionService } from './federal-election/federal-election.service';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import { ParticlePollutionController } from './particle-pollution/particle-pollution.controller';
import { ParticlePollutionService } from './particle-pollution/particle-pollution.service';
import {
  FederalElection,
  FederalElectionSchema
} from './schemas/federal-election.schema';
import {
  OverpassData,
  OverpassDataSchema
} from './schemas/overpass-data.schema';
import { ParticlePollution, ParticlePollutionSchema } from './schemas/particle-pollution.schema';

@Module({
  providers: [OverpassDataService, FederalElectionService, ParticlePollutionService],
  controllers: [FederalElectionController, DataProvisionController, ParticlePollutionController],
  imports: [
    MongooseModule.forFeature([
      { name: OverpassData.name, schema: OverpassDataSchema },
      { name: FederalElection.name, schema: FederalElectionSchema },
      { name: ParticlePollution.name, schema: ParticlePollutionSchema },
    ]),
    HttpModule,
    ClientModule,
    UserModule,
  ],
  exports: [OverpassDataService],
})
export class DataProvisionModule {}

import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import {
  OverpassData,
  OverpassDataSchema,
} from './schemas/overpass-data.schema';
import { ClientModule } from '../client/client.module';
import {
  FederalElection,
  FederalElectionSchema,
} from './schemas/federal-election.schema';
import { FederalElectionService } from './federal-election/federal-election.service';
import { FederalElectionController } from './federal-election/federal-election.controller';
import { UserModule } from 'src/user/user.module';
import {DataProvisionController} from "./data-provision.controller";

@Module({
  providers: [OverpassDataService, FederalElectionService],
  controllers: [FederalElectionController, DataProvisionController],
  imports: [
    MongooseModule.forFeature([
      { name: OverpassData.name, schema: OverpassDataSchema },
      { name: FederalElection.name, schema: FederalElectionSchema },
    ]),
    HttpModule,
    ClientModule,
    UserModule,
  ],
  exports: [OverpassDataService],
})
export class DataProvisionModule {}

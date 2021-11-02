import {forwardRef, HttpModule, Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import { OverpassData, OverpassDataSchema } from './schemas/overpass-data.schema';
import {ClientModule} from "../client/client.module";

@Module({
  providers: [OverpassDataService],
  imports: [
    MongooseModule.forFeature([{ name: OverpassData.name, schema: OverpassDataSchema }]),
    HttpModule,
    ClientModule
  ],
  exports: [OverpassDataService]
})
export class DataProvisionModule {}

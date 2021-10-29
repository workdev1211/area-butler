import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OverpassDataService } from './overpass-data/overpass-data.service';
import { OverpassData, OverpassDataSchema } from './schemas/overpass-data.schema';

@Module({
  providers: [OverpassDataService],
  imports: [
    MongooseModule.forFeature([{ name: OverpassData.name, schema: OverpassDataSchema }]),
    HttpModule
  ],
})
export class DataProvisionModule {}

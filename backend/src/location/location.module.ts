import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ClientModule } from 'src/client/client.module';
import { UserModule } from 'src/user/user.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import {
  LocationSearch,
  LocationSearchschema,
} from './schema/location-search.schema';
import {DataProvisionModule} from "../data-provision/data-provision.module";
import { SearchResultSnapshot, SearchResultSnapshotSchema } from './schema/search-result-snapshot.schema';
import { SearchResultSnapshotController } from './search-result-snapshot.controller';
import { TilesController } from './tiles.controller';

@Module({
  imports: [
    ClientModule,
    AuthModule,
    UserModule,
    DataProvisionModule,
    MongooseModule.forFeature([
      { name: LocationSearch.name, schema: LocationSearchschema },
      { name: SearchResultSnapshot.name, schema: SearchResultSnapshotSchema },
    ]),
  ],
  controllers: [LocationController, SearchResultSnapshotController, TilesController],
  providers: [LocationService],
})
export class LocationModule {}

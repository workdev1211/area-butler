import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import {
  LocationSearch,
  LocationSearchSchema,
} from './schema/location-search.schema';
import { DataProvisionModule } from '../data-provision/data-provision.module';
import {
  SearchResultSnapshot,
  SearchResultSnapshotSchema,
} from './schema/search-result-snapshot.schema';
import { SearchResultSnapshotController } from './search-result-snapshot.controller';
import { TilesController } from './tiles.controller';
import { RealEstateListingModule } from '../real-estate-listing/real-estate-listing.module';
import { ClientModule } from '../client/client.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ClientModule,
    AuthModule,
    UserModule,
    RealEstateListingModule,
    DataProvisionModule,
    MongooseModule.forFeature([
      { name: LocationSearch.name, schema: LocationSearchSchema },
      { name: SearchResultSnapshot.name, schema: SearchResultSnapshotSchema },
    ]),
  ],
  controllers: [
    LocationController,
    SearchResultSnapshotController,
    TilesController,
  ],
  providers: [LocationService],
})
export class LocationModule {}

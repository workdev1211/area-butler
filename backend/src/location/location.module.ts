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
import { ApiSnapshotController } from './api-snapshot.controller';
import { TilesController } from './tiles.controller';
import { ClientModule } from '../client/client.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { LocationListener } from './listener/location.listener';
import { EmbeddedMapController } from './embedded-map.controller';
import { RoutingService } from '../routing/routing.service';
import { HttpModule } from '@nestjs/axios';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import {
  RealEstateListing,
  RealEstateListingSchema,
} from '../real-estate-listing/schema/real-estate-listing.schema';
import { ApiSnapshotService } from './api-snapshot.service';
import { ApiGuard } from './api.guard';
import { MongoParamPipe } from '../pipe/mongo-param.pipe';
import { MongoSortParamPipe } from '../pipe/mongo-sort-param.pipe';

@Module({
  imports: [
    ClientModule,
    AuthModule,
    UserModule,
    DataProvisionModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: LocationSearch.name, schema: LocationSearchSchema },
      { name: SearchResultSnapshot.name, schema: SearchResultSnapshotSchema },
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  controllers: [
    LocationController,
    EmbeddedMapController,
    ApiSnapshotController,
    TilesController,
  ],
  providers: [
    LocationService,
    LocationListener,
    RoutingService,
    RealEstateListingService,
    ApiSnapshotService,
    ApiGuard,
    MongoParamPipe,
    MongoSortParamPipe,
  ],
  exports: [LocationService],
})
export class LocationModule {}

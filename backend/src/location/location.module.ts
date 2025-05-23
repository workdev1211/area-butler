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
import { TilesController } from './tiles.controller';
import { ClientModule } from '../client/client.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { LocationListener } from './listener/location.listener';
import { EmbeddedMapController } from './embedded-map.controller';
import { RoutingService } from '../routing/routing.service';
import { HttpModule } from '@nestjs/axios';
import { SnapshotExtService } from './snapshot-ext.service';
import { LocationExtController } from './location-ext.controller';
import { LocationIntController } from './location-int.controller';
import { AddressesInRangeExtService } from './addresses-in-range-ext.service';
import { LocationExtService } from './location-ext.service';
import { ApiAddressesInRangeController } from './api-addresses-in-range.controller';
import { RealEstateListingModule } from '../real-estate-listing/real-estate-listing.module';
import { SnapshotService } from './snapshot.service';
import { PlaceModule } from '../place/place.module';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { LocationMyvController } from './location-myv.controller';

@Module({
  imports: [
    AuthModule,
    ClientModule,
    DataProvisionModule,
    HttpModule,
    PlaceModule,
    // TODO think about complete removal of the 'realEstateListingIntService' from 'LocationModule'
    RealEstateListingModule,
    UserModule,
    MongooseModule.forFeature([
      { name: LocationSearch.name, schema: LocationSearchSchema },
      { name: SearchResultSnapshot.name, schema: SearchResultSnapshotSchema },
    ]),
  ],
  controllers: [
    ApiAddressesInRangeController,
    EmbeddedMapController,
    LocationExtController,
    LocationIntController,
    LocationMyvController,
    LocationController,
    TilesController,
  ],
  providers: [
    AddressesInRangeExtService,
    FetchSnapshotService,
    LocationExtService,
    LocationListener,
    LocationService,
    RoutingService,
    SnapshotExtService,
    SnapshotService,
  ],
  exports: [
    FetchSnapshotService,
    LocationExtService,
    LocationService,
    SnapshotExtService,
    SnapshotService,
    RealEstateListingModule,
  ],
})
export class LocationModule {}

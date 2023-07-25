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
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import {
  RealEstateListing,
  RealEstateListingSchema,
} from '../real-estate-listing/schema/real-estate-listing.schema';
import { SnapshotExtService } from './snapshot-ext.service';
import { MongoParamPipe } from '../pipe/mongo-param.pipe';
import { MongoSortParamPipe } from '../pipe/mongo-sort-param.pipe';
import { LocationExtController } from './location-ext.controller';
import { OpenAiModule } from '../open-ai/open-ai.module';
import { LocationIntController } from './location-int.controller';
import { LocationIntService } from './location-int.service';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { AddressesInRangeExtService } from './addresses-in-range-ext.service';
import { LocationExtService } from './location-ext.service';
import { ApiAddressesInRangeController } from './api-addresses-in-range.controller';

@Module({
  imports: [
    ClientModule,
    AuthModule,
    UserModule,
    DataProvisionModule,
    HttpModule,
    OpenAiModule,
    MongooseModule.forFeature([
      { name: LocationSearch.name, schema: LocationSearchSchema },
      { name: SearchResultSnapshot.name, schema: SearchResultSnapshotSchema },
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  controllers: [
    LocationController,
    LocationIntController,
    EmbeddedMapController,
    TilesController,
    LocationExtController,
    ApiAddressesInRangeController,
  ],
  providers: [
    LocationService,
    LocationListener,
    RoutingService,
    RealEstateListingService,
    RealEstateListingIntService,
    SnapshotExtService,
    MongoParamPipe,
    MongoSortParamPipe,
    AddressesInRangeExtService,
    LocationIntService,
    LocationExtService,
  ],
  exports: [LocationService, LocationIntService, LocationExtService],
})
export class LocationModule {}

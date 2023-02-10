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
import { ApiAddressesInRangeController } from './api-addresses-in-range.controller';
import { ApiAddressesInRangeService } from './api-addresses-in-range.service';
import { OpenAiModule } from '../open-ai/open-ai.module';
import { ApiOpenImmoService } from './api/open-immo/api-open-immo.service';
import { ApiOpenImmoController } from './api/open-immo/api-open-immo.controller';

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
    EmbeddedMapController,
    ApiSnapshotController,
    TilesController,
    ApiAddressesInRangeController,
    ApiOpenImmoController,
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
    ApiAddressesInRangeService,
    ApiOpenImmoService,
  ],
  exports: [LocationService],
})
export class LocationModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { OpenAiController } from './open-ai.controller';
import { OpenAiService } from './open-ai.service';
import { OpenAiIntController } from './open-ai-int.controller';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import {
  RealEstateListing,
  RealEstateListingSchema,
} from '../real-estate-listing/schema/real-estate-listing.schema';
import { RealEstateListingIntService } from '../real-estate-listing/real-estate-listing-int.service';
import { OpenAiExtController } from './open-ai-ext.controller';
import { LocationExtService } from '../location/location-ext.service';
import { OverpassService } from '../client/overpass/overpass.service';
import { OverpassDataService } from '../data-provision/overpass-data/overpass-data.service';
import { LocationService } from '../location/location.service';
import {
  LocationSearch,
  LocationSearchSchema,
} from '../location/schema/location-search.schema';
import {
  SearchResultSnapshot,
  SearchResultSnapshotSchema,
} from '../location/schema/search-result-snapshot.schema';
import { SnapshotExtService } from '../location/snapshot-ext.service';
import { RoutingService } from '../routing/routing.service';
import { ZensusAtlasService } from '../data-provision/zensus-atlas/zensus-atlas.service';
import { LocationIndexService } from '../data-provision/location-index/location-index.service';
import { DataProvisionModule } from '../data-provision/data-provision.module';

@Module({
  imports: [
    ClientModule,
    HttpModule,
    UserModule,
    DataProvisionModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
      { name: LocationSearch.name, schema: LocationSearchSchema },
      { name: SearchResultSnapshot.name, schema: SearchResultSnapshotSchema },
    ]),
  ],
  providers: [
    OpenAiService,
    RealEstateListingService,
    RealEstateListingIntService,
    LocationService,
    LocationExtService,
    OverpassService,
    OverpassDataService,
    SnapshotExtService,
    RoutingService,
    LocationIndexService,
    ZensusAtlasService,
  ],
  controllers: [OpenAiController, OpenAiIntController, OpenAiExtController],
  exports: [OpenAiService],
})
export class OpenAiModule {}

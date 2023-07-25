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
import {
  OverpassData,
  OverpassDataSchema,
} from '../data-provision/schemas/overpass-data.schema';

@Module({
  imports: [
    ClientModule,
    HttpModule,
    UserModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
      { name: OverpassData.name, schema: OverpassDataSchema },
    ]),
  ],
  providers: [
    OpenAiService,
    RealEstateListingService,
    RealEstateListingIntService,
    LocationExtService,
    OverpassService,
    OverpassDataService,
  ],
  controllers: [OpenAiController, OpenAiIntController, OpenAiExtController],
  exports: [OpenAiService],
})
export class OpenAiModule {}

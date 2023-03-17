import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';
import { RealEstateListingController } from './real-estate-listing.controller';
import { RealEstateListingService } from './real-estate-listing.service';
import {
  RealEstateListing,
  RealEstateListingSchema,
} from './schema/real-estate-listing.schema';
import { ClientModule } from '../client/client.module';
import { OpenAiModule } from '../open-ai/open-ai.module';
import { RealEstateListingIntService } from './real-estate-listing-int.service';

@Module({
  imports: [
    UserModule,
    ClientModule,
    OpenAiModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  providers: [RealEstateListingService, RealEstateListingIntService],
  controllers: [RealEstateListingController],
  exports: [RealEstateListingService, RealEstateListingIntService],
})
export class RealEstateListingModule {}

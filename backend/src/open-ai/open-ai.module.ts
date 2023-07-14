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

@Module({
  imports: [
    ClientModule,
    HttpModule,
    UserModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  providers: [
    OpenAiService,
    RealEstateListingService,
    RealEstateListingIntService,
  ],
  controllers: [OpenAiController, OpenAiIntController],
  exports: [OpenAiService],
})
export class OpenAiModule {}

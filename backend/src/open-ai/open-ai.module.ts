import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { OpenAiController } from './open-ai.controller';
import { OpenAiService } from './open-ai.service';
import { OpenAiIntegrationController } from './open-ai-integration.controller';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import {
  RealEstateListing,
  RealEstateListingSchema,
} from '../real-estate-listing/schema/real-estate-listing.schema';

@Module({
  imports: [
    ClientModule,
    HttpModule,
    UserModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  providers: [OpenAiService, RealEstateListingService],
  controllers: [OpenAiController, OpenAiIntegrationController],
  exports: [OpenAiService],
})
export class OpenAiModule {}

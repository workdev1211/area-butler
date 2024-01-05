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
import { RealEstateListingIntController } from './real-estate-listing-int.controller';
import { RealEstateListingImportService } from './real-estate-listing-import.service';
import { ApiOpenImmoService } from './api/api-open-immo.service';
import { ApiRealEstateListingImportController } from './api/api-real-estate-listing-import.controller';
import { RealEstateCrmImportService } from './real-estate-crm-import.service';
import { DataProvisionModule } from '../data-provision/data-provision.module';

@Module({
  imports: [
    UserModule,
    ClientModule,
    OpenAiModule,
    DataProvisionModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  providers: [
    RealEstateListingService,
    RealEstateListingIntService,
    RealEstateListingImportService,
    ApiOpenImmoService,
    RealEstateCrmImportService,
  ],
  controllers: [
    RealEstateListingController,
    RealEstateListingIntController,
    ApiRealEstateListingImportController,
  ],
  exports: [
    RealEstateListingService,
    RealEstateListingIntService,
    RealEstateCrmImportService,
  ],
})
export class RealEstateListingModule {}

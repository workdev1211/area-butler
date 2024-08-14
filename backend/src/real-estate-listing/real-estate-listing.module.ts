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
import { RealEstateListingIntService } from './real-estate-listing-int.service';
import { RealEstateListingIntController } from './real-estate-listing-int.controller';
import { RealEstateListingImportService } from './real-estate-listing-import.service';
import { RealEstateCrmImportService } from './real-estate-crm-import.service';
import { DataProvisionModule } from '../data-provision/data-provision.module';
import { PlaceModule } from '../place/place.module';

@Module({
  imports: [
    ClientModule,
    DataProvisionModule,
    PlaceModule,
    UserModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  controllers: [RealEstateListingController, RealEstateListingIntController],
  providers: [
    RealEstateListingService,
    RealEstateListingIntService,
    RealEstateListingImportService,
    RealEstateCrmImportService,
  ],
  exports: [
    RealEstateListingService,
    RealEstateListingIntService,
    RealEstateCrmImportService,
  ],
})
export class RealEstateListingModule {}

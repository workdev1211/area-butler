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

@Module({
  imports: [
    UserModule,
    ClientModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  providers: [RealEstateListingService],
  controllers: [RealEstateListingController],
  exports: [RealEstateListingService],
})
export class RealEstateListingModule {}

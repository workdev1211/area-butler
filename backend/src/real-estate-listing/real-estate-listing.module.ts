import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { RealEstateListingController } from './real-estate-listing.controller';
import { RealEstateListingService } from './real-estate-listing.service';
import {
  RealEstateListing,
  RealEstateListingSchema,
} from './schema/real-estate-listing.schema';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: RealEstateListing.name, schema: RealEstateListingSchema },
    ]),
  ],
  providers: [RealEstateListingService],
  controllers: [RealEstateListingController],
})
export class RealEstateListingModule {}

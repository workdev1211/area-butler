import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OnOfficeService } from './on-office.service';
import { OnOfficeController } from './on-office.controller';
import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import {
  OnOfficeTransaction,
  OnOfficeTransactionSchema,
} from './schema/on-office-transaction.schema';
import { RealEstateListingModule } from '../real-estate-listing/real-estate-listing.module';
import { PlaceModule } from '../place/place.module';
import { OnOfficeWebhookController } from './on-office-webhook.controller';

@Module({
  imports: [
    ClientModule,
    LocationModule,
    PlaceModule,
    RealEstateListingModule,
    UserModule,
    MongooseModule.forFeature([
      { name: OnOfficeTransaction.name, schema: OnOfficeTransactionSchema },
    ]),
  ],
  controllers: [OnOfficeController, OnOfficeWebhookController],
  providers: [OnOfficeService],
})
export class OnOfficeModule {}

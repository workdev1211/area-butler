import { Module } from '@nestjs/common';

import { RealEstateListingModule } from '../real-estate-listing/real-estate-listing.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import { PropstackController } from './propstack.controller';
import { PropstackWebhookController } from './propstack-webhook.controller';
import { PropstackWebhookIntController } from './propstack-webhook-int.controller';
import { PropstackService } from './propstack.service';
import { PropstackWebhookService } from './propstack-webhook.service';
import { PlaceModule } from '../place/place.module';
import { ClientModule } from '../client/client.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ClientModule,
    HttpModule,
    LocationModule,
    PlaceModule,
    RealEstateListingModule,
    UserModule,
  ],
  controllers: [
    PropstackController,
    PropstackWebhookController,
    PropstackWebhookIntController,
  ],
  providers: [PropstackService, PropstackWebhookService],
})
export class PropstackModule {}

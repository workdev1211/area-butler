import { Module } from '@nestjs/common';

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
import { OpenAiModule } from '../open-ai/open-ai.module';
import { PropstackConnectStrategy } from './auth/propstack-connect.strategy';
import { PropstackWebhookIntStrategy } from './auth/propstack-webhook-int.strategy';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    ClientModule,
    CompanyModule,
    HttpModule,
    LocationModule,
    OpenAiModule,
    PlaceModule,
    UserModule,
  ],
  controllers: [
    PropstackController,
    PropstackWebhookController,
    PropstackWebhookIntController,
  ],
  providers: [
    PropstackService,
    PropstackWebhookService,
    PropstackConnectStrategy,
    PropstackWebhookIntStrategy,
  ],
})
export class PropstackModule {}

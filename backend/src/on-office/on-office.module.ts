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
import { PlaceModule } from '../place/place.module';
import { OnOfficeWebhookController } from './on-office-webhook.controller';
import { OnOfficeWebhookService } from './on-office-webhook.service';
import { OpenAiModule } from '../open-ai/open-ai.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    ClientModule,
    CompanyModule,
    LocationModule,
    OpenAiModule,
    PlaceModule,
    UserModule,
    MongooseModule.forFeature([
      { name: OnOfficeTransaction.name, schema: OnOfficeTransactionSchema },
    ]),
  ],
  controllers: [OnOfficeController, OnOfficeWebhookController],
  providers: [OnOfficeService, OnOfficeWebhookService],
  exports: [OnOfficeService]
})
export class OnOfficeModule {}

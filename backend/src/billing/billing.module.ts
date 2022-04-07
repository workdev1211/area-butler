import { Module } from '@nestjs/common';
import { ClientModule } from '../client/client.module';
import { UserModule } from '../user/user.module';
import { BillingWebhookController } from './billing-webhook.controller';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingListener } from './listener/billing.listener';

@Module({
  controllers: [BillingController, BillingWebhookController],
  providers: [BillingService, BillingListener],
  imports: [ClientModule, UserModule],
})
export class BillingModule {}

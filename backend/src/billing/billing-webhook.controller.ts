import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('api/billing')
export class BillingWebhookController {
  constructor(private billingService: BillingService) {}

  @Post('webhook')
  @HttpCode(200)
  async consumeWebhook(@Req() request): Promise<void> {
    await this.billingService.consumeWebhook(request);
  }
}

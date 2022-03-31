import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('billing')
@Controller('api/billing')
export class BillingWebhookController {
  constructor(private billingService: BillingService) {}

  @ApiOperation({ description: 'Webhook for stripe' })
  @Post('webhook')
  @HttpCode(200)
  async consumeWebhook(@Req() request): Promise<void> {
    await this.billingService.consumeWebhook(request);
  }
}

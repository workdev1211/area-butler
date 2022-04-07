import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCreateCheckoutDto } from '../dto/api-create-checkout.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { BillingService } from './billing.service';


@ApiTags('billing')
@Controller('api/billing')
export class BillingController extends AuthenticatedController {
  constructor(private billingService: BillingService) {
    super();
  }

  @ApiOperation({ description: 'Create a new stripe customer portal link' })
  @Post('create-customer-portal-link')
  async createCustomerPortalLink(
    @InjectUser() user: UserDocument,
  ): Promise<string> {
    user.stripeCustomerId;
    return this.billingService.createCustomerPortalLink(user);
  }

  @ApiOperation({ description: 'Create a new stripe checkout url' })
  @Post('create-checkout-url')
  async createCheckoutUrl(
    @InjectUser() user: UserDocument,
    @Body() createCheckout: ApiCreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSessionUrl(user, createCheckout);
  }
}

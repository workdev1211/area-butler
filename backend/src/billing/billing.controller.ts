import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiCreateCheckoutDto } from '../dto/api-create-checkout.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { BillingService } from './billing.service';
import { ILimitIncreaseMetadata } from '@area-butler-types/billing';

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

  @ApiOperation({ description: 'Create a new PayPal order' })
  @Post('create-paypal-order')
  async createPaypalOrder(
    @InjectUser() user: UserDocument,
    // TODO create DTOs
    @Body() createPaypalOrder: { priceId: string },
  ): Promise<string> {
    return this.billingService.createPaypalOrder(
      user,
      createPaypalOrder.priceId,
    );
  }

  @ApiOperation({ description: 'Capture a PayPal order payment' })
  @Post('capture-paypal-order-payment')
  async capturePaypalOrderPayment(
    @InjectUser() user: UserDocument,
    // TODO create DTOs
    @Body()
    capturePaypalPayment: {
      orderId: string;
      metadata?: ILimitIncreaseMetadata;
    },
  ): Promise<string> {
    return this.billingService.capturePaypalOrderPayment(
      user,
      capturePaypalPayment.orderId,
      capturePaypalPayment.metadata,
    );
  }

  @ApiOperation({ description: 'Create a new PayPal subscription' })
  @Post('create-paypal-subscription')
  async createPaypalSubscription(
    @InjectUser() user: UserDocument,
    // TODO create DTOs
    @Body() createPaypalSubscription: { priceId: string },
  ): Promise<string> {
    return this.billingService.createPaypalSubscription(
      user,
      createPaypalSubscription.priceId,
    );
  }

  @ApiOperation({ description: 'Capture a PayPal subscription payment' })
  @Post('approve-paypal-subscription')
  async approvePaypalSubscription(
    @InjectUser() user: UserDocument,
    // TODO create DTOs
    @Body() approvePaypalSubscription: { subscriptionId: string },
  ): Promise<string> {
    return this.billingService.approvePaypalSubscription(
      user,
      approvePaypalSubscription.subscriptionId,
    );
  }
}

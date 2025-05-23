import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiCreateCheckoutDto } from '../dto/api-create-checkout.dto';
import { AuthenticatedController } from '../shared/authenticated.controller';
import { InjectUser } from '../user/inject-user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { BillingService } from './billing.service';
import ApiCreatePaypalOrderDto from '../dto/api-create-paypal-order.dto';
import ApiCapturePaypalPaymentDto from '../dto/api-capture-paypal-payment.dto';
import ApiApprovePaypalSubscriptionDto from '../dto/api-approve-paypal-subscription.dto';

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
    @Body() { priceId }: ApiCreatePaypalOrderDto,
  ): Promise<string> {
    return this.billingService.createPaypalOrder(user, priceId);
  }

  @ApiOperation({ description: 'Capture a PayPal order payment' })
  @Post('capture-paypal-order-payment')
  async capturePaypalOrderPayment(
    @InjectUser() user: UserDocument,
    @Body()
    { orderId, metadata }: ApiCapturePaypalPaymentDto,
  ): Promise<string> {
    return this.billingService.capturePaypalOrderPayment(
      user,
      orderId,
      metadata,
    );
  }

  @ApiOperation({ description: 'Create a new PayPal subscription' })
  @Post('create-paypal-subscription')
  async createPaypalSubscription(
    @InjectUser() user: UserDocument,
    @Body() { priceId }: ApiCreatePaypalOrderDto,
  ): Promise<string> {
    return this.billingService.createPaypalSubscription(user, priceId);
  }

  @ApiOperation({ description: 'Capture a PayPal subscription payment' })
  @Post('approve-paypal-subscription')
  async approvePaypalSubscription(
    @InjectUser() user: UserDocument,
    @Body() { subscriptionId }: ApiApprovePaypalSubscriptionDto,
  ): Promise<string> {
    return this.billingService.approvePaypalSubscription(user, subscriptionId);
  }
}

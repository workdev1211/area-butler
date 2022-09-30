import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import {
  ApiCreateCheckout,
  ApiStripeCheckoutModeEnum,
} from '@area-butler-types/billing';
import { configService } from '../../config/config.service';
import { UserDocument } from '../../user/schema/user.schema';

@Injectable()
export class StripeService {
  stripeClient: Stripe;
  stripeWebhookSecret: string;

  constructor() {
    this.stripeClient = new Stripe(configService.getStripeKey(), {
      apiVersion: '2020-08-27',
    });

    this.stripeWebhookSecret = configService.getStripeWebhookSecret();
  }

  async createCustomerPortalLink(user: UserDocument): Promise<string> {
    const stripeSession: Stripe.BillingPortal.Session =
      await this.stripeClient.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        locale: 'de',
        return_url: configService.getBaseAppUrl(),
      });

    return stripeSession.url;
  }

  async createCheckoutSessionUrl(
    user: UserDocument,
    {
      priceId,
      amount = 1,
      // trialPeriod,
      mode = ApiStripeCheckoutModeEnum.Subscription,
      metadata,
    }: ApiCreateCheckout,
  ): Promise<string> {
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
      ['card'];

    if (mode === ApiStripeCheckoutModeEnum.Payment) {
      paymentMethodTypes.push('giropay');
    }

    const checkoutUrl: Stripe.Checkout.Session =
      await this.stripeClient.checkout.sessions.create({
        customer: user.stripeCustomerId,
        mode,
        payment_method_types: paymentMethodTypes,
        billing_address_collection: 'required',
        allow_promotion_codes: true,
        locale: 'de',
        // subscription_data: {
        //   trial_period_days: trialPeriod,
        // },
        line_items: [
          {
            price: priceId,
            quantity: amount,
            tax_rates: [configService.getStripeTaxId()],
          },
        ],
        success_url: `${configService.getCallbackUrl()}?${
          mode === 'subscription' ? 'subscriptionId' : 'checkoutId'
        }={CHECKOUT_SESSION_ID}`,
        cancel_url: configService.getBaseAppUrl(),
        metadata,
      });

    return checkoutUrl.url;
  }

  async createCustomer(user: UserDocument): Promise<string> {
    const stripeCustomer: Stripe.Customer =
      await this.stripeClient.customers.create({
        email: user.email,
        name: user.fullname,
      });

    return stripeCustomer.id;
  }

  constructEvent(request: any): Stripe.Event {
    const webhookSecret = configService.getStripeWebhookSecret();
    const signature = request.headers['stripe-signature'];

    try {
      return this.stripeClient.webhooks.constructEvent(
        request.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error(`Webhook signature verification failed.`);
      throw new Error('Webhook signature verification failed.');
    }
  }

  async fetchLineItemsFromCheckoutSession(
    checkoutSessionId: string,
  ): Promise<Stripe.LineItem[]> {
    const lineItems = await this.stripeClient.checkout.sessions.listLineItems(
      checkoutSessionId,
    );

    return lineItems.data;
  }

  async fetchSubscriptionData(
    stripeSubscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return this.stripeClient.subscriptions.retrieve(stripeSubscriptionId);
  }
}

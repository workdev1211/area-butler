import { HttpException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import Stripe from 'stripe';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';

import {
  paypalWithWoTrialPriceIdMapping,
  stripeToPaypalPriceIdMapping,
  TRIAL_DAYS,
} from '../../../shared/constants/subscription-plan';
import { SubscriptionService } from '../user/subscription.service';
import { ApiCreateCheckoutDto } from '../dto/api-create-checkout.dto';
import {
  SlackChannel,
  SlackSenderService,
} from '../client/slack/slack-sender.service';
import { StripeService } from '../client/stripe/stripe.service';
import {
  EventType,
  ILimitIncreaseEvent,
  SubscriptionCreateEvent,
  SubscriptionRenewEvent,
} from '../event/event.types';
import { UserDocument } from '../user/schema/user.schema';
import {
  ApiSubscriptionLimitsEnum,
  IApiSubscriptionLimitIncreaseParams,
  PaymentSystemTypeEnum,
} from '@area-butler-types/subscription-plan';
import {
  ApiStripeCheckoutPaymentStatusEnum,
  ILimitIncreaseMetadata,
} from '@area-butler-types/billing';
import { PaypalService } from '../client/paypal/paypal.service';
import { PaymentItemTypeEnum } from '../shared/subscription.types';
import { configService } from '../config/config.service';
import { PaypalWebhookEventTypeEnum } from '../shared/paypal.types';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paypalService: PaypalService,
    private readonly subscriptionService: SubscriptionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly slackSenderService: SlackSenderService,
  ) {}

  async createCustomerPortalLink(user: UserDocument): Promise<string> {
    return this.stripeService.createCustomerPortalLink(user);
  }

  async createCheckoutSessionUrl(
    user: UserDocument,
    createCheckout: ApiCreateCheckoutDto,
  ): Promise<string> {
    const existingSubscriptions =
      await this.subscriptionService.fetchAllUserSubscriptions(user._id);

    return this.stripeService.createCheckoutSessionUrl(user, {
      ...createCheckout,
      trialPeriod: existingSubscriptions.length ? undefined : TRIAL_DAYS,
    });
  }

  async consumeWebhook(request: any): Promise<void> {
    try {
      const event = this.stripeService.constructEvent(request);
      this.logger.log(`Consumed Stripe event with the type: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed': {
          if (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            event.data.object.payment_status ===
            ApiStripeCheckoutPaymentStatusEnum.Paid
          ) {
            await this.handleCheckoutSessionCompleted(event.data);
          }

          break;
        }

        case 'customer.subscription.created': {
          this.slackSenderService.sendNotifcation(SlackChannel.REVENUES, {
            textBlocks: ['🎉 New customer has signed a subscription 🎉! '],
          });
          this.handleSubscriptionUpsertEvent(event.data);
          break;
        }

        case 'customer.subscription.updated': {
          this.handleSubscriptionUpsertEvent(event.data);
          break;
        }

        case 'invoice.paid': {
          this.slackSenderService.sendNotifcation(SlackChannel.REVENUES, {
            textBlocks: ['💰 Invoice paid, ka-ching 💰!'],
          });
          this.handleInvoicePaid(event.data);
          break;
        }

        default: {
          console.log(`Unknown Type: ${event.type}`);
          console.log(JSON.stringify(event.data));
          break;
        }
      }
    } catch {
      throw new HttpException('Failed to consume stripe webhook', 400);
    }
  }

  private async handleCheckoutSessionCompleted(eventData: Stripe.Event.Data) {
    const payload = eventData.object as any;

    const { id: checkoutSessionId, customer: customerId, metadata } = payload;

    const lineItems =
      await this.stripeService.fetchLineItemsFromCheckoutSession(
        checkoutSessionId,
      );

    if (lineItems.length > 0) {
      const lineItem = lineItems[0];

      const limitIncreaseParams =
        this.subscriptionService.getLimitIncreaseParams(lineItem.price.id);

      // skips if there are no increase package items (adds the number of requests) in the checkout
      if (limitIncreaseParams) {
        this.emitLimitIncreaseEvent(limitIncreaseParams, {
          customerId,
          metadata,
          paymentSystemType: PaymentSystemTypeEnum.Stripe,
        });
      }
    }
  }

  private handleSubscriptionUpsertEvent(eventData: Stripe.Event.Data) {
    const payload = eventData.object as any;
    const stripeCustomerId = payload.customer;
    const stripePriceId = payload.items.data[0].price.id;
    const stripeSubscriptionId = payload.id;
    const endsAt = payload.current_period_end;

    this.emitSubscriptionUpsertEvent(
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      dayjs(endsAt * 1000).toDate(),
      PaymentSystemTypeEnum.Stripe,
    );
  }

  private handleInvoicePaid(eventData: Stripe.Event.Data) {
    const payload = eventData.object as any;
    const stripeCustomerId = payload.customer;
    const stripeSubscriptionId = payload.subscription;

    this.emitSubscriptionRenewEvent({
      customerId: stripeCustomerId,
      subscriptionId: stripeSubscriptionId,
      paymentSystemType: PaymentSystemTypeEnum.Stripe,
    });
  }

  async createPaypalOrder(
    user: UserDocument,
    priceId: string,
  ): Promise<string> {
    const paymentItem = this.subscriptionService.getPaymentItem(priceId);

    if (paymentItem.type !== PaymentItemTypeEnum.LimitIncrease) {
      throw new HttpException(
        'Current payment item is not a limit increase one.',
        400,
      );
    }

    const orderData = await this.paypalService.createOrder(
      user.email,
      paymentItem.item as IApiSubscriptionLimitIncreaseParams,
    );

    return orderData.id;
  }

  async capturePaypalOrderPayment(
    user: UserDocument,
    orderId: string,
    metadata?: ILimitIncreaseMetadata,
  ): Promise<string> {
    const capturedPayment = await this.paypalService.capturePayment(orderId);

    this.logger.debug(
      `Captured PayPal payment from the user ${capturedPayment.payer.payer_id} with the status ${capturedPayment.status}`,
    );

    const paymentItem = this.subscriptionService.getPaymentItem(
      `${capturedPayment.purchase_units[0].payments.captures[0].custom_id}`,
    );

    if (paymentItem.type !== PaymentItemTypeEnum.LimitIncrease) {
      throw new HttpException(
        'Current payment item is not a limit increase one.',
        400,
      );
    }

    user.paypalCustomerId = capturedPayment.payer.payer_id;
    await user.save();

    this.emitLimitIncreaseEvent(
      paymentItem.item as IApiSubscriptionLimitIncreaseParams,
      {
        customerId: user.paypalCustomerId,
        metadata,
        paymentSystemType: PaymentSystemTypeEnum.PayPal,
      },
    );

    return `${configService.getBaseAppUrl()}/profile`;
  }

  async createPaypalSubscription(
    { _id: userId }: UserDocument,
    priceId: string,
  ): Promise<string> {
    let paypalSubscriptionPlanId = stripeToPaypalPriceIdMapping.get(priceId);
    const paymentItem = this.subscriptionService.getPaymentItem(priceId);

    if (
      !paypalSubscriptionPlanId ||
      paymentItem.type !== PaymentItemTypeEnum.SubscriptionPrice
    ) {
      throw new HttpException(
        'PayPal subscription not found or this is not a subscription!',
        400,
      );
    }

    if (await this.subscriptionService.countAllUserSubscriptions(userId)) {
      paypalSubscriptionPlanId = paypalWithWoTrialPriceIdMapping.get(
        paypalSubscriptionPlanId,
      );
    }

    const subscriptionDetails = await this.paypalService.createSubscription(
      paypalSubscriptionPlanId,
      paymentItem,
      userId,
    );

    return subscriptionDetails.id;
  }

  async approvePaypalSubscription(
    user: UserDocument,
    subscriptionId: string,
  ): Promise<string> {
    // TODO destructor subscriptionDetails
    const subscriptionDetails =
      await this.paypalService.showSubscriptionDetails(subscriptionId);

    this.logger.log(
      `PayPal subscription status is ${subscriptionDetails.status}`,
    );

    if (!['ACTIVE', 'EXPIRED'].includes(subscriptionDetails.status)) {
      throw new HttpException('Subscription status is incorrect!', 400);
    }

    const { userId, priceId } = JSON.parse(subscriptionDetails.custom_id);
    const {
      price: { interval },
    } = this.subscriptionService.getApiSubscriptionPlanPrice(priceId);

    if (user.id !== userId) {
      const cancellationReason = 'Buyer and approval user ids are different!';

      await this.paypalService.cancelSubscription(
        subscriptionId,
        cancellationReason,
      );

      throw new HttpException(cancellationReason, 400);
    }

    user.paypalCustomerId = subscriptionDetails.subscriber.payer_id;
    await user.save();

    const nextBillingTime = subscriptionDetails.billing_info.next_billing_time;
    const subscriptionStartTime = subscriptionDetails.start_time;
    let endsAt;

    if (nextBillingTime) {
      const dateTimePattern = new RegExp(/(.+)T(.+)(\.\d{3})?Z/);
      const nextBillingIsoTime = dayjs(nextBillingTime).toISOString();
      const subscriptionStartIsoTime = dayjs(
        subscriptionDetails.start_time,
      ).toISOString();

      endsAt = dayjs(
        `${nextBillingIsoTime.replace(
          dateTimePattern,
          '$1',
        )}T${subscriptionStartIsoTime.replace(dateTimePattern, '$2')}Z`,
      );
    } else {
      endsAt = dayjs(subscriptionStartTime).add(
        interval.value,
        interval.unit as ManipulateType,
      );
    }

    this.emitSubscriptionUpsertEvent(
      user.paypalCustomerId,
      subscriptionDetails.id,
      priceId,
      endsAt.toDate(),
      PaymentSystemTypeEnum.PayPal,
    );

    return `${configService.getCallbackUrl()}?subscriptionId=${
      subscriptionDetails.id
    }`;
  }

  async consumePaypalWebhook(request: any): Promise<void> {
    const {
      'paypal-auth-algo': authAlgo,
      'paypal-cert-url': certUrl,
      'paypal-transmission-id': transmissionId,
      'paypal-transmission-sig': transmissionSig,
      'paypal-transmission-time': transmissionTime,
    } = request.headers;

    const webhookEvent = request.body;

    await this.paypalService.verifyWebhookSignature({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_event: webhookEvent,
    });

    this.logger.log(
      `Consumed PayPal event with the type: ${webhookEvent.event_type}`,
    );

    switch (webhookEvent.event_type) {
      case PaypalWebhookEventTypeEnum.PaymentSaleCompleted: {
        this.emitSubscriptionRenewEvent({
          subscriptionId: webhookEvent.resource.billing_agreement_id,
          paymentSystemType: PaymentSystemTypeEnum.PayPal,
        });
      }
    }
  }

  private emitLimitIncreaseEvent(
    limitIncreaseParams: IApiSubscriptionLimitIncreaseParams,
    {
      customerId,
      metadata,
      paymentSystemType,
    }: {
      customerId: string;
      paymentSystemType: PaymentSystemTypeEnum;
      metadata?: ILimitIncreaseMetadata;
    },
    quantity?: number,
  ) {
    const limitIncreaseEvent: ILimitIncreaseEvent = {
      paymentSystemType,
      amount: { ...limitIncreaseParams.amount },
    };

    if (quantity) {
      limitIncreaseEvent.amount.value = quantity;
    }

    switch (limitIncreaseParams.type) {
      case ApiSubscriptionLimitsEnum.NumberOfRequests: {
        this.eventEmitter.emitAsync(
          EventType.REQUEST_CONTINGENT_INCREASE_EVENT,
          { ...limitIncreaseEvent, customerId },
        );
        break;
      }

      case ApiSubscriptionLimitsEnum.AddressExpiration: {
        this.eventEmitter.emitAsync(
          EventType.ADDRESS_EXPIRATION_INCREASE_EVENT,
          { ...limitIncreaseEvent, metadata },
        );
        break;
      }
    }
  }

  private emitSubscriptionUpsertEvent(
    customerId: string,
    subscriptionId: string,
    priceId: string,
    endsAt: Date,
    paymentSystemType: PaymentSystemTypeEnum,
  ) {
    const subscriptionUpsertEvent: SubscriptionCreateEvent = {
      customerId,
      subscriptionId,
      priceId,
      endsAt,
      paymentSystemType,
    };

    this.eventEmitter.emitAsync(
      EventType.SUBSCRIPTION_UPSERT_EVENT,
      subscriptionUpsertEvent,
    );
  }

  private emitSubscriptionRenewEvent(event: SubscriptionRenewEvent) {
    if (event.subscriptionId) {
      this.eventEmitter.emitAsync(EventType.SUBSCRIPTION_RENEW_EVENT, event);
    }
  }
}

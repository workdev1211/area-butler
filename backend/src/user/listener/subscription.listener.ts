import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as dayjs from 'dayjs';

import { StripeService } from '../../client/stripe/stripe.service';
import {
  EventType,
  ILimitIncreaseEvent,
  SubscriptionCreateEvent,
  SubscriptionRenewEvent,
} from '../../event/event.types';
import { SubscriptionService } from '../subscription.service';
import { UserService } from '../user.service';
import { PaymentSystemTypeEnum } from '@area-butler-types/subscription-plan';
import { PaypalService } from '../../client/paypal/paypal.service';
import { stripeToPaypalPriceIdMapping } from '../../../../shared/constants/subscription-plan';
import { ManipulateType } from 'dayjs';

@Injectable()
export class SubscriptionListener {
  private logger: Logger = new Logger(SubscriptionListener.name);

  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
    private paypalService: PaypalService,
  ) {}

  @OnEvent(EventType.SUBSCRIPTION_UPSERT_EVENT, { async: true })
  private async handleSubscriptionUpsertEvent({
    customerId,
    subscriptionId,
    priceId,
    endsAt,
    paymentSystemType,
  }: SubscriptionCreateEvent): Promise<void> {
    let user;

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.Stripe: {
        user = await this.userService.findByStripeCustomerId(customerId);
        break;
      }

      case PaymentSystemTypeEnum.PayPal: {
        user = await this.userService.findByPaypalCustomerId(customerId);
        break;
      }
    }

    const {
      plan: { type },
    } = this.subscriptionService.getApiSubscriptionPlanPrice(priceId);

    if (!user || !type) {
      return;
    }

    await this.subscriptionService.upsertByUserId(
      user._id,
      type,
      subscriptionId,
      priceId,
      endsAt,
      paymentSystemType,
    );

    await this.userService.setRequestContingents(user, endsAt);
  }

  @OnEvent(EventType.SUBSCRIPTION_RENEW_EVENT, { async: true })
  private async handleSubscriptionRenewEvent({
    customerId,
    subscriptionId,
    paymentSystemType,
  }: SubscriptionRenewEvent): Promise<void> {
    let user;
    let subscription;
    let newEndDate;

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.Stripe: {
        user = await this.userService.findByStripeCustomerId(customerId);

        subscription = await this.stripeService.fetchSubscriptionData(
          subscriptionId,
        );

        newEndDate = dayjs(subscription.current_period_end * 1000);

        break;
      }

      case PaymentSystemTypeEnum.PayPal: {
        subscription = await this.paypalService.showSubscriptionDetails(
          subscriptionId,
        );

        // TODO should be removed after testing
        this.logger.debug(
          `PayPal subscription status: ${subscription.status}, start time: ${subscription.start_time}`,
        );

        user = await this.userService.findByPaypalCustomerId(
          subscription.subscriber.payer_id,
        );

        const {
          price: { interval },
        } = this.subscriptionService.getApiSubscriptionPlanPrice(
          stripeToPaypalPriceIdMapping.get(subscription.plan_id),
        );

        newEndDate = dayjs(subscription.start_time).add(
          interval.value,
          interval.unit as ManipulateType,
        );

        break;
      }
    }

    if (user && subscription) {
      await this.subscriptionService.renewSubscription(
        subscriptionId,
        newEndDate.toDate(),
        paymentSystemType,
      );

      await this.userService.setRequestContingents(user, newEndDate);
    }
  }

  @OnEvent(EventType.REQUEST_CONTINGENT_INCREASE_EVENT, { async: true })
  private async handleRequestContingentIncreaseEvent({
    customer: { stripeCustomerId, email },
    amount,
  }: ILimitIncreaseEvent): Promise<void> {
    let user;

    if (stripeCustomerId) {
      user = await this.userService.findByStripeCustomerId(stripeCustomerId);
    }

    if (email) {
      user = await this.userService.findByEmail(email);
    }

    if (user) {
      await this.userService.addRequestContingentIncrease(user, amount.value);
    }
  }
}

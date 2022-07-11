import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

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

@Injectable()
export class SubscriptionListener {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
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
    stripeSubscriptionId,
    stripeCustomerId,
  }: SubscriptionRenewEvent): Promise<void> {
    const user = await this.userService.findByStripeCustomerId(
      stripeCustomerId,
    );

    const subscription = await this.stripeService.fetchSubscriptionData(
      stripeSubscriptionId,
    );

    const newEndDate = new Date(subscription.current_period_end * 1000);

    if (user && subscription) {
      await this.subscriptionService.renewSubscription(
        stripeSubscriptionId,
        newEndDate,
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

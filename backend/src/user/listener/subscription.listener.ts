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

@Injectable()
export class SubscriptionListener {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
  ) {}

  @OnEvent(EventType.SUBSCRIPTION_UPSERT_EVENT, { async: true })
  private async handleSubscriptionUpsertEvent({
    stripeCustomerId,
    stripePriceId,
    stripeSubscriptionId,
    endsAt,
    trialEndsAt,
  }: SubscriptionCreateEvent) {
    const user = await this.userService.findByStripeCustomerId(
      stripeCustomerId,
    );

    const {
      plan: { type },
    } =
      this.subscriptionService.getApiSubscriptionPlanPriceByStripePriceId(
        stripePriceId,
      );

    if (!user || !type) {
      return;
    }

    await this.subscriptionService.upsertByUserId(
      user._id,
      type,
      stripeSubscriptionId,
      stripePriceId,
      endsAt,
      trialEndsAt,
    );

    await this.userService.setRequestContingents(user, endsAt);
  }

  @OnEvent(EventType.SUBSCRIPTION_RENEW_EVENT, { async: true })
  private async handleSubscriptionRenewEvent({
    stripeSubscriptionId,
    stripeCustomerId,
  }: SubscriptionRenewEvent) {
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
    stripeCustomerId,
    amount,
  }: ILimitIncreaseEvent) {
    const user = await this.userService.findByStripeCustomerId(
      stripeCustomerId,
    );

    if (user) {
      await this.userService.addRequestContingentIncrease(user, amount);
    }
  }
}

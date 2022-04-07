import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StripeService } from '../../client/stripe/stripe.service';
import { EventType, RequestContingentIncreasedEvent, SubscriptionCreatedEvent, SubscriptionRenewedEvent } from '../../event/event.types';
import { SubscriptionService } from '../subscription.service';
import { UserService } from '../user.service';

@Injectable()
export class SubscriptionListener {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
  ) {}

  @OnEvent(EventType.SUBSCRIPTION_UPSERTED_EVENT, { async: true })
  private async handleSubscriptionUpsertedEvent({
    stripeCustomerId,
    stripePriceId,
    stripeSubscriptionId,
    endsAt,
    trialEndsAt,
  }: SubscriptionCreatedEvent) {
    const user = await this.userService.findByStripeCustomerId(
      stripeCustomerId,
    );
    const plan =
      this.subscriptionService.getApiSubscriptionPlanForStripePriceId(
        stripePriceId,
      );
    if (user && plan) {
      await this.subscriptionService.upsertForUserId(
        user._id,
        plan.type,
        stripeSubscriptionId,
        stripePriceId,
        endsAt,
        trialEndsAt,
      );
      await this.userService.addMonthlyRequestContingents(user, endsAt);
    }
  }

  @OnEvent(EventType.SUBSCRIPTION_RENEWED_EVENT, { async: true })
  private async handleSubscriptionRenewedEvent({
    stripeSubscriptionId,
    stripeCustomerId,
  }: SubscriptionRenewedEvent) {
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
      await this.userService.addMonthlyRequestContingents(user, newEndDate);
    }
  }

  @OnEvent(EventType.REQUEST_CONTINGENT_INCREASED_EVENT, { async: true })
  private async handleRequestContingentIncreasedEvent({
    stripeCustomerId,
    amount,
  }: RequestContingentIncreasedEvent) {
    const user = await this.userService.findByStripeCustomerId(
      stripeCustomerId,
    );
    if (!!user) {
      await this.userService.addRequestContingentIncrease(user, amount);
    }
  }
}

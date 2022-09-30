import { HttpException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';

import { StripeService } from '../../client/stripe/stripe.service';
import {
  EventType,
  ILimitIncreaseEvent,
  ISubscriptionUpsertEvent,
  ISubscriptionRenewEvent,
  ITrialSubscriptionUpsertEvent,
} from '../../event/event.types';
import { SubscriptionService } from '../subscription.service';
import { UserService } from '../user.service';
import { PaymentSystemTypeEnum } from '@area-butler-types/subscription-plan';
import { PaypalService } from '../../client/paypal/paypal.service';
import { stripeToPaypalPriceIdMapping } from '../../../../shared/constants/subscription-plan';

@Injectable()
export class SubscriptionListener {
  private logger: Logger = new Logger(SubscriptionListener.name);

  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
    private paypalService: PaypalService,
  ) {}

  @OnEvent(EventType.TRIAL_SUBSCRIPTION_UPSERT_EVENT, { async: true })
  private async handleTrialSubscriptionUpsertEvent({
    user,
    endsAt,
  }: ITrialSubscriptionUpsertEvent): Promise<void> {
    await this.subscriptionService.upsertTrialForUser(user.id, endsAt);
    await this.userService.setRequestContingents(user, endsAt);
  }

  @OnEvent(EventType.SUBSCRIPTION_UPSERT_EVENT, { async: true })
  private async handleSubscriptionUpsertEvent({
    customerId,
    subscriptionId,
    priceId,
    endsAt,
    paymentSystemType,
  }: ISubscriptionUpsertEvent): Promise<void> {
    let user;

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.STRIPE: {
        user = await this.userService.findByStripeCustomerId(customerId);
        break;
      }

      case PaymentSystemTypeEnum.PAYPAL: {
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

    await this.subscriptionService.upsertForUser({
      user,
      type,
      priceId,
      endsAt,
      subscriptionId,
      paymentSystemType,
    });

    await this.userService.setRequestContingents(user, endsAt);
  }

  @OnEvent(EventType.SUBSCRIPTION_RENEW_EVENT, { async: true })
  private async handleSubscriptionRenewEvent({
    customerId,
    subscriptionId,
    paymentSystemType,
  }: ISubscriptionRenewEvent): Promise<void> {
    let user;
    let subscription;
    let newEndDate;

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.STRIPE: {
        user = await this.userService.findByStripeCustomerId(customerId);

        subscription = await this.stripeService.fetchSubscriptionData(
          subscriptionId,
        );

        newEndDate = dayjs(subscription.current_period_end * 1000);

        break;
      }

      case PaymentSystemTypeEnum.PAYPAL: {
        subscription = await this.paypalService.showSubscriptionDetails(
          subscriptionId,
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

      await this.userService.setRequestContingents(user, newEndDate.toDate());
    }
  }

  @OnEvent(EventType.REQUEST_CONTINGENT_INCREASE_EVENT, { async: true })
  private async handleRequestContingentIncreaseEvent({
    customerId,
    amount,
    paymentSystemType,
  }: ILimitIncreaseEvent): Promise<void> {
    let user;

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.STRIPE: {
        user = await this.userService.findByStripeCustomerId(customerId);
        break;
      }

      case PaymentSystemTypeEnum.PAYPAL: {
        user = await this.userService.findByPaypalCustomerId(customerId);
        break;
      }
    }

    if (user) {
      await this.userService.addRequestContingentIncrease(user, amount.value);
    }
  }
}

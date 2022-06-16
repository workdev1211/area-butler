import { HttpException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import Stripe from 'stripe';

import { TRIAL_DAYS } from '../../../shared/constants/subscription-plan';
import { SubscriptionService } from '../user/subscription.service';
import { ApiCreateCheckoutDto } from '../dto/api-create-checkout.dto';
import {
  SlackSenderService,
  SlackChannel,
} from '../client/slack/slack-sender.service';
import { StripeService } from '../client/stripe/stripe.service';
import {
  EventType,
  SubscriptionRenewEvent,
  SubscriptionCreateEvent,
  ILimitIncreaseEvent,
} from '../event/event.types';
import { UserDocument } from '../user/schema/user.schema';
import { ApiSubscriptionLimitsEnum } from '@area-butler-types/subscription-plan';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private stripeService: StripeService,
    private subscriptionService: SubscriptionService,
    private eventEmitter: EventEmitter2,
    private slackSenderService: SlackSenderService,
  ) {}

  async createCustomerPortalLink(user: UserDocument): Promise<string> {
    return this.stripeService.createCustomerPortalLink(user);
  }

  async createCheckoutSessionUrl(
    user: UserDocument,
    createCheckout: ApiCreateCheckoutDto,
  ): Promise<string> {
    const existingSubscriptions =
      await this.subscriptionService.allUserSubscriptions(user._id);

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
          await this.handleCheckoutSessionCompleted(event.data);
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
    const stripeCustomerId = payload.customer;
    const checkoutSessionId = payload.id;

    const lineItems =
      await this.stripeService.fetchLineItemsFromCheckoutSession(
        checkoutSessionId,
      );

    if (lineItems.length > 0) {
      const lineItem = lineItems[0];

      const limitIncreaseParams = this.subscriptionService.getLimitIncreaseParams(
        lineItem.price.id,
      );

      // skips if there are no increase package items (adds the number of requests) in the checkout
      if (limitIncreaseParams) {
        const limitIncreaseEvent: ILimitIncreaseEvent = {
          stripeCustomerId,
          amount: lineItem.quantity,
        };

        switch (limitIncreaseParams.type) {
          case ApiSubscriptionLimitsEnum.NumberOfRequests: {
            this.eventEmitter.emitAsync(
              EventType.REQUEST_CONTINGENT_INCREASE_EVENT,
              limitIncreaseEvent,
            );
            break;
          }
        }
      }
    }
  }

  private handleSubscriptionUpsertEvent(eventData: Stripe.Event.Data) {
    const payload = eventData.object as any;
    const stripeCustomerId = payload.customer;
    const stripePriceId = payload.items.data[0].price.id;
    const stripeSubscriptionId = payload.id;
    const trialEndsAt = payload.trial_end;
    const endsAt = payload.current_period_end;

    const subscriptionUpsertEvent: SubscriptionCreateEvent = {
      stripeCustomerId,
      stripePriceId,
      stripeSubscriptionId,
      trialEndsAt: new Date(trialEndsAt * 1000),
      endsAt: new Date(endsAt * 1000),
    };

    this.eventEmitter.emitAsync(
      EventType.SUBSCRIPTION_UPSERT_EVENT,
      subscriptionUpsertEvent,
    );
  }

  private handleInvoicePaid(eventData: Stripe.Event.Data) {
    const payload = eventData.object as any;
    const stripeCustomerId = payload.customer;
    const stripeSubscriptionId = payload.subscription;

    const event: SubscriptionRenewEvent = {
      stripeCustomerId,
      stripeSubscriptionId,
    };

    if (stripeSubscriptionId) {
      this.eventEmitter.emitAsync(EventType.SUBSCRIPTION_RENEW_EVENT, event);
    }
  }
}

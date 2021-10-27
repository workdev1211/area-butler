import { ApiCreateCheckout } from '@area-butler-types/billing';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { StripeService } from 'src/client/stripe/stripe.service';
import {
  EventType,
  RequestContingentIncreasedEvent,
  SubscriptionCreatedEvent,
} from 'src/event/event.types';
import { UserDocument } from 'src/user/schema/user.schema';
import { allSubscriptions } from '../../../shared/constants/subscription-plan';

@Injectable()
export class BillingService {
  constructor(
    private stripeService: StripeService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createCustomerPortalLink(user: UserDocument): Promise<string> {
    return this.stripeService.createCustomerPortalLink(user);
  }

  async createCheckoutSessionUrl(
    user: UserDocument,
    createCheckout: ApiCreateCheckout,
  ): Promise<string> {
    return this.stripeService.createCheckoutSessionUrl(user, createCheckout);
  }

  async consumeWebhook(request: any, requestBody: any): Promise<void> {
    switch (requestBody.type) {
      case 'checkout.session.completed': {
        await this.handleCheckoutSessionCompleted(requestBody);
        break;
      }
      case 'customer.subscription.created': {
        this.handleSubscriptionCreatedEvent(requestBody);
        break;
      }
      default: {
        console.log('Unknown Type: ' + requestBody.type);
        console.log(JSON.stringify(requestBody));
        break;
      }
    }
  }

  private async handleCheckoutSessionCompleted(requestBody) {
    const payload = requestBody.data.object;
    const stripeCustomerId = payload.customer;
    const checkoutSessionId = payload.id;
    const lineItems = await this.stripeService.fetchLineItemsFromCheckoutSession(
      checkoutSessionId,
    );

    if (lineItems.length > 0) {
      const lineItem = lineItems[0];
      const requestIncreasingLineItem = Object.values(allSubscriptions).some(
        subscription =>
          subscription.priceIds.requestIncreaseId === lineItem.price.id,
      );

      if (!!requestIncreasingLineItem) {
        const requestContingentIncreasedEvent: RequestContingentIncreasedEvent = {
          stripeCustomerId,
          amount: lineItem.quantity,
        };

        this.eventEmitter.emitAsync(
          EventType.REQUEST_CONTINGENT_INCREASED_EVENT,
          requestContingentIncreasedEvent,
        );
      }
    }
  }

  private handleSubscriptionCreatedEvent(requestBody) {
    const payload = requestBody.data.object;
    const stripeCustomerId = payload.customer;
    const stripePriceId = payload.items.data[0].price.id;

    const subscriptionCreatedEvent: SubscriptionCreatedEvent = {
      stripeCustomerId,
      stripePriceId,
    };

    this.eventEmitter.emitAsync(
      EventType.SUBSCRIPTION_CREATED_EVENT,
      subscriptionCreatedEvent,
    );
  }
}

import { ApiCreateCheckout } from '@area-butler-types/billing';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { StripeService } from 'src/client/stripe/stripe.service';
import { EventType, SubscriptionCreatedEvent } from 'src/event/event.types';
import { UserDocument } from 'src/user/schema/user.schema';

@Injectable()
export class BillingService {


    constructor(private stripeService: StripeService, private eventEmitter: EventEmitter2) {

    }


    async createCustomerPortalLink(user: UserDocument): Promise<string> {
        return this.stripeService.createCustomerPortalLink(user);
    }


    async createCheckoutSessionUrl(user: UserDocument, createCheckout: ApiCreateCheckout): Promise<string> {
        return this.stripeService.createCheckoutSessionUrl(user, createCheckout);
    }


    async consumeWebhook(request: any, requestBody: any): Promise<void> {
        switch(requestBody.type) {
            case 'customer.subscription.created': {
                this.handleSubscriptionCreatedEvent(requestBody);
                break;
            }
            default: {
                console.log('Unknown Type: ' + requestBody.type)
                break;
            }
        }
    }

    private handleSubscriptionCreatedEvent(requestBody) {
        const payload = requestBody.data.object;
        const stripeCustomerId = payload.customer;
        const stripePriceId = payload.items.data[0].price.id;

        const subscriptionCreatedEvent : SubscriptionCreatedEvent = {
            stripeCustomerId,
            stripePriceId
        }

        this.eventEmitter.emitAsync(EventType.SUBSCRIPTION_CREATED_EVENT, subscriptionCreatedEvent);

    }

}

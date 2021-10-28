import {ApiCreateCheckout} from '@area-butler-types/billing';
import {HttpException, Injectable} from '@nestjs/common';
import {EventEmitter2} from 'eventemitter2';
import {StripeService} from 'src/client/stripe/stripe.service';
import {
    EventType,
    RequestContingentIncreasedEvent,
    SubscriptionCreatedEvent,
    SubscriptionRenewedEvent,
} from 'src/event/event.types';
import {UserDocument} from 'src/user/schema/user.schema';
import {allSubscriptions, TRIAL_DAYS} from '../../../shared/constants/subscription-plan';
import {configService} from "../config/config.service";
import Stripe from "stripe";
import {SubscriptionService} from "../user/subscription.service";

@Injectable()
export class BillingService {
    constructor(
        private stripeService: StripeService,
        private subscriptionService: SubscriptionService,
        private eventEmitter: EventEmitter2,
    ) {
    }

    async createCustomerPortalLink(user: UserDocument): Promise<string> {
        return this.stripeService.createCustomerPortalLink(user);
    }

    async createCheckoutSessionUrl(
        user: UserDocument,
        createCheckout: ApiCreateCheckout,
    ): Promise<string> {
        const existingsSubscriptions = await this.subscriptionService.allUserSubscriptions(user._id);
        return this.stripeService.createCheckoutSessionUrl(user, {
            ...createCheckout,
            trialPeriod: existingsSubscriptions.length ? null: TRIAL_DAYS
        });
    }

    async consumeWebhook(request: any): Promise<void> {
        try {
            const event = this.stripeService.constructEvent(request);
            switch (event.type) {
                case 'checkout.session.completed': {
                    await this.handleCheckoutSessionCompleted(event.data);
                    break;
                }
                case 'customer.subscription.created': {
                    this.handleSubscriptionCreatedEvent(event.data);
                    break;
                }
                case 'invoice.paid': {
                    this.handleInvoicePaid(event.data);
                    break;
                }
                default: {
                    console.log('Unknown Type: ' + event.type);
                    console.log(JSON.stringify(event.data));
                    break;
                }
            }
        } catch {
            throw new HttpException("Failed to consume stripe webhook", 400);
        }

    }

    private async handleCheckoutSessionCompleted(eventData: Stripe.Event.Data) {
        const stripeEnv = configService.getStripeEnv();
        const payload = eventData.object as any;
        const stripeCustomerId = payload.customer;
        const checkoutSessionId = payload.id;
        const lineItems = await this.stripeService.fetchLineItemsFromCheckoutSession(
            checkoutSessionId,
        );

        if (lineItems.length > 0) {
            const lineItem = lineItems[0];
            const requestIncreasingLineItem = Object.values(allSubscriptions).some(
                subscription =>
                    subscription.priceIds[stripeEnv].requestIncreaseId === lineItem.price.id,
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

    private handleSubscriptionCreatedEvent(eventData: Stripe.Event.Data) {
        const payload = eventData.object as any;
        const stripeCustomerId = payload.customer;
        const stripePriceId = payload.items.data[0].price.id;
        const stripeSubscriptionId = payload.id;
        const trialEndsAt = payload.trial_end;
        const endsAt = payload.current_period_end;

        const subscriptionCreatedEvent: SubscriptionCreatedEvent = {
            stripeCustomerId,
            stripePriceId,
            stripeSubscriptionId,
            trialEndsAt: new Date(trialEndsAt * 1000),
            endsAt: new Date(endsAt * 1000)
        };

        this.eventEmitter.emitAsync(
            EventType.SUBSCRIPTION_CREATED_EVENT,
            subscriptionCreatedEvent,
        );
    }

    private handleInvoicePaid(eventData: Stripe.Event.Data) {
        const payload = eventData.object as any;
        const stripeCustomerId = payload.customer;
        const stripeSubscriptionId = payload.subscription;

        const event: SubscriptionRenewedEvent = {
            stripeCustomerId,
            stripeSubscriptionId
        }

        if (stripeSubscriptionId) {
            this.eventEmitter.emitAsync(
                EventType.SUBSCRIPTION_RENEWED_EVENT,
                event
            )
        }
    }
}

import { ApiSubscriptionPlanType } from "@area-butler-types/subscription-plan";
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
    EventType,
    RequestContingentIncreasedEvent,
    SubscriptionCreatedEvent, SubscriptionRenewedEvent, UserEvent
} from "src/event/event.types";
import { StripeService } from "../../client/stripe/stripe.service";
import { SubscriptionService } from "../subscription.service";
import { UserService } from "../user.service";

@Injectable()
export class SubscriptionListener {

    private logger: Logger = new Logger(SubscriptionListener.name);

    constructor(private userService: UserService, private subscriptionService: SubscriptionService, private stripeService: StripeService) {
    }

    @OnEvent(EventType.USER_CONSENT_EVENT, {async: true})
    private async handleUserConsentGivenEvent({user}: UserEvent) {
        this.logger.log('User has given consent');
        const endsAt = new Date();
        endsAt.setDate(new Date().getDate() + 14);
        await this.subscriptionService.upsertForUserId(user._id, ApiSubscriptionPlanType.TRIAL, 'trialSubcription', 'trialSubscription', endsAt, endsAt);
        await this.userService.addMonthlyRequestContingents(user, endsAt);
    }

    @OnEvent(EventType.SUBSCRIPTION_UPSERTED_EVENT, {async: true})
    private async handleSubscriptionUpsertedEvent({
                                                     stripeCustomerId,
                                                     stripePriceId,
                                                     stripeSubscriptionId,
                                                     endsAt,
                                                     trialEndsAt
                                                 }: SubscriptionCreatedEvent) {
        const user = await this.userService.findByStripeCustomerId(stripeCustomerId);
        const plan = this.subscriptionService.getApiSubscriptionPlanForStripePriceId(stripePriceId);
        if (user && plan) {
            await this.subscriptionService.upsertForUserId(user._id, plan.type, stripeSubscriptionId, stripePriceId, endsAt, trialEndsAt);
            await this.userService.addMonthlyRequestContingents(user, endsAt);
        }
    }

    @OnEvent(EventType.SUBSCRIPTION_RENEWED_EVENT,  {async: true})
    private async handleSubscriptionRenewedEvent({stripeSubscriptionId, stripeCustomerId}: SubscriptionRenewedEvent) {
        const user = await this.userService.findByStripeCustomerId(stripeCustomerId);
        const subscription = await this.stripeService.fetchSubscriptionData(stripeSubscriptionId);
        const newEndDate = new Date(subscription.current_period_end * 1000);
        if (user && subscription) {
            await this.subscriptionService.renewSubscription(stripeSubscriptionId, newEndDate);
            await this.userService.addMonthlyRequestContingents(user, newEndDate);
        }
    }

    @OnEvent(EventType.REQUEST_CONTINGENT_INCREASED_EVENT, {async: true})
    private async handleRequestContingentIncreasedEvent({stripeCustomerId, amount}: RequestContingentIncreasedEvent) {
        const user = await this.userService.findByStripeCustomerId(stripeCustomerId);
        if (!!user) {
            await this.userService.addRequestContingentIncrease(user, amount);
        }
    }
}

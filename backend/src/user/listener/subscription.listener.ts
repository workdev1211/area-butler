import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {
    EventType,
    RequestContingentIncreasedEvent,
    SubscriptionCreatedEvent, SubscriptionRenewedEvent
} from "src/event/event.types";
import {UserService} from "../user.service";
import {SubscriptionService} from "../subscription.service";
import {StripeService} from "../../client/stripe/stripe.service";
import { configService } from "src/config/config.service";

@Injectable()
export class SubscriptionListener {
    constructor(private userService: UserService, private subscriptionService: SubscriptionService, private stripeService: StripeService) {
    }

    @OnEvent(EventType.SUBSCRIPTION_CREATED_EVENT, {async: true})
    private async handleSubscriptionCreatedEvent({
                                                     stripeCustomerId,
                                                     stripePriceId,
                                                     stripeSubscriptionId,
                                                     endsAt,
                                                     trialEndsAt
                                                 }: SubscriptionCreatedEvent) {
        const user = await this.userService.findByStripeCustomerId(stripeCustomerId);
        const plan = this.subscriptionService.getApiSubscriptionPlanForStripePriceId(stripePriceId);
        const stripeEnv = configService.getStripeEnv();
        if (user && plan) {
            await this.subscriptionService.createForUserId(user._id, plan.type, stripeSubscriptionId, stripePriceId, endsAt, trialEndsAt);
            
            if (plan.priceIds[stripeEnv].monthlyId === stripePriceId) {
                // Add monthly contingent
                await this.userService.addMonthlyRequestContingentIfMissing(user, new Date());

            } else if (plan.priceIds[stripeEnv].annuallyId === stripePriceId) {

                // Add anually contingent
                for (let month = 0; month < 12; month++) {
                    const monthlyContingent = new Date();
                    monthlyContingent.setMonth(monthlyContingent.getMonth() + month);
                    await this.userService.addMonthlyRequestContingentIfMissing(user, monthlyContingent);
                }
            }

        }
    }

    @OnEvent(EventType.SUBSCRIPTION_RENEWED_EVENT,  {async: true})
    private async handleSubscriptionRenewedEvent({stripeSubscriptionId}: SubscriptionRenewedEvent) {
        const subscription = await this.stripeService.fetchSubscriptionData(stripeSubscriptionId);
        const newEndDate = new Date(subscription.current_period_end * 1000);
        await this.subscriptionService.renewSubscription(stripeSubscriptionId, newEndDate);
    }

    @OnEvent(EventType.REQUEST_CONTINGENT_INCREASED_EVENT, {async: true})
    private async handleRequestContingentIncreasedEvent({stripeCustomerId, amount}: RequestContingentIncreasedEvent) {
        const user = await this.userService.findByStripeCustomerId(stripeCustomerId);
        if (!!user) {
            await this.userService.addRequestContingentIncrease(user, amount);
        }
    }
}

import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EventType, RequestContingentIncreasedEvent, SubscriptionCreatedEvent } from "src/event/event.types";
import { UserService } from "../user.service";

@Injectable()
export class UserListener {
  constructor(private userService: UserService) {}

  @OnEvent(EventType.SUBSCRIPTION_CREATED_EVENT, { async: true })
  private async handleSubscriptionCreatedEvent({ stripeCustomerId, stripePriceId }: SubscriptionCreatedEvent) {
    await this.userService.changeSubscriptionPlan(stripeCustomerId, stripePriceId);
  }

  @OnEvent(EventType.REQUEST_CONTINGENT_INCREASED_EVENT, { async: true })
  private async handleRequestContingentIncreasedEvent({ stripeCustomerId, amount }: RequestContingentIncreasedEvent) {
    const user = await this.userService.findByStripeCustomerId(stripeCustomerId);
    if (!!user) {
      await this.userService.addRequestContingentIncrease(user, amount);
    }
  }
}
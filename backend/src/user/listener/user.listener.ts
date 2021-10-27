import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EventType, SubscriptionCreatedEvent } from "src/event/event.types";
import { UserService } from "../user.service";

@Injectable()
export class UserListener {
  constructor(private userService: UserService) {}

  @OnEvent(EventType.SUBSCRIPTION_CREATED_EVENT, { async: true })
  private async handleSubscriptionCreatedEvent({ stripeCustomerId: stripeCostumerId, stripePriceId }: SubscriptionCreatedEvent) {
    await this.userService.changeSubscriptionPlan(stripeCostumerId, stripePriceId);
  }
}
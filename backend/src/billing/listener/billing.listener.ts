import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { StripeService } from "src/client/stripe/stripe.service";
import { EventType, UserCreatedEvent } from "src/event/event.types";
import { UserService } from "src/user/user.service";

@Injectable()
export class BillingListener {
  constructor(private stripeService: StripeService, private userService: UserService) {}

  @OnEvent(EventType.USER_CREATED_EVENT, { async: true })
  private async handleUserCreatedEvent({ user }: UserCreatedEvent) {
    const stripeCustomerId = await this.stripeService.createCustomer(user);

    await this.userService.setStripeCustomerId(user, stripeCustomerId);

  }
}

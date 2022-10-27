import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { StripeService } from '../../client/stripe/stripe.service';
import { EventType, IUserCreatedEvent } from '../../event/event.types';
import { UserService } from '../../user/user.service';

@Injectable()
export class BillingListener {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
  ) {}

  @OnEvent(EventType.USER_CREATED_EVENT, { async: true })
  private async handleUserCreatedEvent({
    user,
  }: IUserCreatedEvent): Promise<void> {
    const stripeCustomerId = await this.stripeService.createCustomer(user);
    await this.userService.setStripeCustomerId(user.id, stripeCustomerId);
  }
}

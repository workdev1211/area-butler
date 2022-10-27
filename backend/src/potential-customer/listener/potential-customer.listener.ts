import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventType, IUserCreatedEvent } from '../../event/event.types';
import { PotentialCustomerService } from '../potential-customer.service';

@Injectable()
export class PotentialCustomerListener {
  constructor(
    private readonly potentialCustomerService: PotentialCustomerService,
  ) {}

  @OnEvent(EventType.USER_CREATED_EVENT, { async: true })
  private async handleUserCreatedEvent({
    user: { id: userId },
  }: IUserCreatedEvent): Promise<void> {
    await this.potentialCustomerService.insertDefaultPotentialCustomers(userId);
  }
}

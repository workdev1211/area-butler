import { Injectable } from '@nestjs/common';

import {
  EventType,
  IIntUserCreatedEvent,
  IUserCreatedEvent,
} from '../../event/event.types';
import { PotentialCustomerService } from '../potential-customer.service';
import { OnEvents } from '../../shared/decorators/on-events.decorator';

@Injectable()
export class PotentialCustomerListener {
  constructor(
    private readonly potentialCustomerService: PotentialCustomerService,
  ) {}

  @OnEvents([EventType.INT_USER_CREATED_EVENT, EventType.USER_CREATED_EVENT], {
    async: true,
  })
  private handleUserCreatedEvent({
    user,
  }: IUserCreatedEvent | IIntUserCreatedEvent): void {
    void this.potentialCustomerService.createDefault(user);
  }
}

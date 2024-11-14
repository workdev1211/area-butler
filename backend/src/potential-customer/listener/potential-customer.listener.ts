import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  EventType,
  IIntUserCreatedEvent,
  IUserCreatedEvent,
} from '../../event/event.types';
import { PotentialCustomerService } from '../potential-customer.service';

@Injectable()
export class PotentialCustomerListener {
  constructor(
    private readonly potentialCustomerService: PotentialCustomerService,
  ) {}

  @OnEvent(EventType.INT_USER_CREATED_EVENT, {
    async: true,
  })
  private handleIntUserCreatedEvent({
    user,
  }: IUserCreatedEvent | IIntUserCreatedEvent): void {
    void this.potentialCustomerService.createDefault(user);
  }

  @OnEvent(EventType.USER_CREATED_EVENT, {
    async: true,
  })
  private handleUserCreatedEvent({
    user,
  }: IUserCreatedEvent | IIntUserCreatedEvent): void {
    void this.potentialCustomerService.createDefault(user);
  }
}

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  EventType,
  IIntegrationUserCreatedEvent,
  IUserCreatedEvent,
} from '../../event/event.types';
import { PotentialCustomerService } from '../potential-customer.service';

@Injectable()
export class PotentialCustomerListener {
  constructor(
    private readonly potentialCustomerService: PotentialCustomerService,
  ) {}

  // Array doesn't work as expected for the 'OnEvent' decorator
  @OnEvent(EventType.USER_CREATED_EVENT, { async: true })
  private async handleUserCreatedEvent({
    user,
  }: IUserCreatedEvent): Promise<void> {
    await this.potentialCustomerService.createDefaultPotentialCustomers(user);
  }

  @OnEvent(EventType.INTEGRATION_USER_CREATED_EVENT, { async: true })
  private async handleIntegrationUserCreatedEvent({
    integrationUser,
  }: IIntegrationUserCreatedEvent): Promise<void> {
    await this.potentialCustomerService.createDefaultPotentialCustomers(
      integrationUser,
    );
  }
}

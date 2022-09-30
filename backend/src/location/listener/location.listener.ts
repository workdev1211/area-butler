import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  EventType,
  ILimitIncreaseEvent,
  ITrialDataRemoveEvent,
} from '../../event/event.types';
import { LocationService } from '../location.service';

@Injectable()
export class LocationListener {
  constructor(private locationService: LocationService) {}

  @OnEvent(EventType.ADDRESS_EXPIRATION_INCREASE_EVENT, { async: true })
  private async handleAddressExpirationIncreaseEvent({
    amount,
    metadata: { modelName, modelId },
  }: ILimitIncreaseEvent): Promise<void> {
    await this.locationService.prolongAddressDuration(
      modelName,
      modelId,
      amount,
    );
  }

  @OnEvent(EventType.TRIAL_DATA_REMOVE_EVENT, { async: true })
  private async handleTrialDataRemoveEvent({
    userId,
  }: ITrialDataRemoveEvent): Promise<void> {
    await this.locationService.deleteTrialDataByUserId(userId);
  }
}

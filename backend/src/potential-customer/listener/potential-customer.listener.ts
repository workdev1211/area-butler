import { ApiUpsertPotentialCustomer } from '@area-butler-types/potential-customer';
import { MeansOfTransportation, OsmName, UnitsOfTransportation } from '@area-butler-types/types';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType, UserCreatedEvent } from 'src/event/event.types';
import { PotentialCustomerService } from '../potential-customer.service';

const createInitialPotentialCustomer: () => ApiUpsertPotentialCustomer = () => ({
    name: 'Max Mustermann',
    email: 'man.mustermann@area-butler.de',
    routingProfiles: [{type: MeansOfTransportation.BICYCLE, amount: 1000, unit: UnitsOfTransportation.METERS}],
    preferredAmenities: [OsmName.bar, OsmName.chemist, OsmName.kiosk, OsmName.doctors]
});

@Injectable()
export class PotentialCustomerListener {
  constructor(private potentialCustomerService: PotentialCustomerService) {}

  @OnEvent(EventType.USER_CREATED_EVENT, { async: true })
  private async handleUserCreatedEvent({ user }: UserCreatedEvent) {
    await this.potentialCustomerService.insertPotentialCustomer(user, createInitialPotentialCustomer());
  }
}

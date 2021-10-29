import {
  ApiEnergyEfficiency,
  ApiFurnishing,
  ApiRealEstateCostType,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType, UserCreatedEvent } from 'src/event/event.types';
import { RealEstateListingService } from '../real-estate-listing.service';

const createInitialRealEstateListing: () => ApiUpsertRealEstateListing = () => ({
  name: 'Mein Erstes Inserat',
  address: 'Jungfernstieg 1, Hamburg',
  coordinates: {
    lat: 53.5515357,
    lng: 9.9938558,
  },
  costStructure: {
    price: {
      amount: 2500,
      currency: '€',
    },
    type: ApiRealEstateCostType.RENT_MONTHLY_COLD,
  },
  characteristics: {
    numberOfRooms: 3,
    propertySizeInSquareMeters: 500,
    realEstateSizeInSquareMeters: 50,
    energyEfficiency: ApiEnergyEfficiency.A,
    furnishing: [ApiFurnishing.BALCONY],
  },
});

@Injectable()
export class RealEstateListingListener {
  constructor(private realEstateListingService: RealEstateListingService) {}

  @OnEvent(EventType.USER_CREATED_EVENT, { async: true })
  private async handleUserCreatedEvent({ user }: UserCreatedEvent) {
    await this.realEstateListingService.insertRealEstateListing(
      user,
      createInitialRealEstateListing(),
      false
    );
  }
}

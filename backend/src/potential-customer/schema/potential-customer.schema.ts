import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
} from '@area-butler-types/real-estate';
import { OsmName, TransportationParam } from '@area-butler-types/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PotentialCustomerDocument = PotentialCustomer & Document;

@Schema()
export class PotentialCustomer {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: Array })
  routingProfiles: TransportationParam[];

  @Prop({ type: Array })
  preferredAmenities: OsmName[];

  @Prop({ type: Object })
  realEstateCharacteristics: ApiRealEstateCharacteristics;

  @Prop({ type: Object })
  realEstateCostStructure: ApiRealEstateCost;

  @Prop({ type: Array, default: [] })
  preferredLocations: ApiPreferredLocation[];
}

export const PotentialCustomerSchema =
  SchemaFactory.createForClass(PotentialCustomer);

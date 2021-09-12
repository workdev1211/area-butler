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

  @Prop({ type: Array })
  routingProfiles: TransportationParam[];

  @Prop({ type: Array })
  preferredAmenities: OsmName[];
}

export const PotentialCustomerSchema = SchemaFactory.createForClass(
  PotentialCustomer,
);

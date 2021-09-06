import { ApiAddress, ApiCoordinates } from '@area-butler-types/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RealEstateListingDocument = RealEstateListing & Document;

@Schema()
export class RealEstateListing {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Map, required: true })
  address: ApiAddress;

  @Prop({ type: Map, required: true })
  coordinates: ApiCoordinates;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const RealEstateListingSchema = SchemaFactory.createForClass(
  RealEstateListing,
);

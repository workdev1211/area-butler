import { ApiRealEstateCharacteristics, ApiRealEstateCost } from '@area-butler-types/real-estate';
import { ApiAddress, ApiCoordinates, ApiMoneyAmount } from '@area-butler-types/types';
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

  @Prop({ type: Map })
  coordinates: ApiCoordinates;
  
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
  
  @Prop({ type: Map})
  costStructure: ApiRealEstateCost;  
  
  @Prop({ type: Map})
  characterstics: ApiRealEstateCharacteristics;
  
}

export const RealEstateListingSchema = SchemaFactory.createForClass(
  RealEstateListing,
);

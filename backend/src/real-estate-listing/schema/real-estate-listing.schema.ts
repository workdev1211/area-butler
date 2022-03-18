import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
} from '@area-butler-types/real-estate';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeoJsonPoint } from 'src/shared/geo-json.types';

export type RealEstateListingDocument = RealEstateListing & Document;

@Schema()
export class RealEstateListing {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: false })
  externalUrl: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;  
  
  @Prop({ type: Boolean, default: true })
  showInSnippet: boolean;

  @Prop({ type: Object })
  costStructure: ApiRealEstateCost;

  @Prop({ type: Object })
  characteristics: ApiRealEstateCharacteristics;

  @Prop({ type: Object })
  location: GeoJsonPoint;
}

export const RealEstateListingSchema = SchemaFactory.createForClass(
  RealEstateListing,
);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
  ApiRealEstateStatusEnum,
} from '@area-butler-types/real-estate';
import { GeoJsonPoint } from '../../shared/geo-json.types';

export type RealEstateListingDocument = RealEstateListing & Document;

@Schema()
export class RealEstateListing {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  externalUrl: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, default: true })
  showInSnippet: boolean;

  @Prop({ type: Object })
  costStructure: ApiRealEstateCost;

  @Prop({ type: Object })
  characteristics: ApiRealEstateCharacteristics;

  @Prop({ type: Object, required: true })
  location: GeoJsonPoint;

  @Prop({ default: ApiRealEstateStatusEnum.IN_PREPARATION })
  status: ApiRealEstateStatusEnum;

  @Prop({ type: String })
  externalId: string;
}

export const RealEstateListingSchema =
  SchemaFactory.createForClass(RealEstateListing);

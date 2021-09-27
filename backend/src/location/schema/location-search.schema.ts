import { ApiSearch } from '@area-butler-types/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationSearchDocument = LocationSearch & Document;

@Schema()
export class LocationSearch {
  @Prop({ type: Object })
  locationSearch: ApiSearch;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const LocationSearchschema = SchemaFactory.createForClass(
  LocationSearch,
);

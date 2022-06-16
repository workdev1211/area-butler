import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ApiSearch } from '@area-butler-types/types';

export type LocationSearchDocument = LocationSearch & Document;

@Schema()
export class LocationSearch {
  @Prop()
  userId: string;

  @Prop({ type: Object })
  locationSearch: ApiSearch;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  endsAt: Date;
}

export const LocationSearchSchema =
  SchemaFactory.createForClass(LocationSearch);

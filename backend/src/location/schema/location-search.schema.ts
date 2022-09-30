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

  // TODO check why do we need two "endsAt" fields - this one and inside the "locationSearch"
  @Prop({ type: Date })
  endsAt: Date;

  @Prop({ default: false })
  isTrial: boolean;
}

export const LocationSearchSchema =
  SchemaFactory.createForClass(LocationSearch);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
} from '@area-butler-types/types';

export type SearchResultSnapshotDocument = SearchResultSnapshot & Document;

@Schema()
export class SearchResultSnapshot {
  @Prop()
  userId: string;

  @Prop()
  token: string;

  @Prop()
  description: string;

  @Prop()
  mapboxAccessToken: string;

  @Prop({ type: Object })
  config: ApiSearchResultSnapshotConfig;

  @Prop({ type: Object })
  snapshot: ApiSearchResultSnapshot;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  lastAccess: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  endsAt: Date;

  @Prop({ default: 0 })
  visitAmount: number;
}

export const SearchResultSnapshotSchema =
  SchemaFactory.createForClass(SearchResultSnapshot);

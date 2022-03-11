import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
} from '@area-butler-types/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchResultSnapshotDocument = SearchResultSnapshot & Document;

@Schema()
export class SearchResultSnapshot {
  @Prop()
  userId: string;

  @Prop()
  token: string;

  @Prop()
  mapboxAccessToken: string;

  @Prop({ type: Object, required: false })
  config: ApiSearchResultSnapshotConfig;

  @Prop({ type: Object })
  snapshot: ApiSearchResultSnapshot;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  lastAccess: Date
}

export const SearchResultSnapshotSchema = SchemaFactory.createForClass(
  SearchResultSnapshot,
);

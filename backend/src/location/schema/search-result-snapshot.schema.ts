import { ApiSearchResultSnapshot } from "@area-butler-types/types";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type SearchResultSnapshotDocument = SearchResultSnapshot & Document;

@Schema()
export class SearchResultSnapshot {

  @Prop()
  userId: string;
  
  @Prop()
  token: string;

  @Prop()
  mapboxAccessToken: string;

  @Prop({ type: Object })
  snapshot: ApiSearchResultSnapshot;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

}

export const SearchResultSnapshotSchema = SchemaFactory.createForClass(
    SearchResultSnapshot,
);
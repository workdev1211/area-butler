import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ZipLevelDataDocument = ZipLevelData & Document;

@Schema({ collection: 'zip_level_data' })
export class ZipLevelData {
  @Prop()
  type: string;

  @Prop(raw({}))
  properties: Record<string, any>;

  @Prop(
    raw({
      type: { type: String },
      coordinates: { type: [[[[Number]]]] },
    }),
  )
  geometry: Record<string, any>;
}

export const ZipLevelDataSchema = SchemaFactory.createForClass(ZipLevelData);

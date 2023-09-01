import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ZensusAtlasDocument = ZensusAtlas & Document;

@Schema()
export class ZensusAtlas {
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

export const ZensusAtlasSchema = SchemaFactory.createForClass(ZensusAtlas);

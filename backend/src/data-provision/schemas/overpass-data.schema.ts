import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type OverpassDataDocument = OverpassData & Document;

@Schema()
export class OverpassData {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  geometry: {
    type: string; // Point
    coordinates: any[]; //
  }; // GeoJSON

  @Prop()
  overpassId: string;

  @Prop()
  entityType: string;

  @Prop()
  type: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  tags: object;
}

export const OverpassDataSchema = SchemaFactory.createForClass(OverpassData);

OverpassDataSchema.index({ 'properties.id': 1 });

import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ParticlePollutionDocument = ParticlePollution & Document;

@Schema()
export class ParticlePollution {
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

export const ParticlePollutionSchema =
  SchemaFactory.createForClass(ParticlePollution);

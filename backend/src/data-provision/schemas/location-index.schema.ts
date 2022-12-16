import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ApiGeojsonType, ApiGeometry } from '@area-butler-types/types';
import { TApiLocationIndexFeatureProperties } from '@area-butler-types/location-index';

export type LocationIndexDocument = LocationIndex & Document;

@Schema({ collection: 'index_tiles' })
export class LocationIndex {
  @Prop()
  type: ApiGeojsonType;

  @Prop(raw({}))
  properties: TApiLocationIndexFeatureProperties;

  @Prop(
    raw({
      type: { type: String },
      coordinates: { type: [[[[Number]]]] },
    }),
  )
  geometry: ApiGeometry;
}

export const LocationIndexSchema = SchemaFactory.createForClass(LocationIndex);

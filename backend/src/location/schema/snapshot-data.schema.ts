import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  IApiPlacesLocation,
  TransportationParam,
} from '@area-butler-types/types';
import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import { EntityRoute, EntityTransitRoute } from '@area-butler-types/routing';

@Schema({ _id: false })
class SnapshotData implements ApiSearchResultSnapshot {
  @Prop({ type: Array, required: true })
  localityParams: ApiOsmEntity[]; // selected POI types

  @Prop({ type: Object, required: true })
  location: ApiCoordinates; // coordinates

  @Prop({ type: Object, required: true })
  placesLocation: any | IApiPlacesLocation; // Google Places id or an address

  @Prop({ type: Object, required: true })
  searchResponse: ApiSearchResponse; // POIs

  @Prop({ type: Array, required: true })
  transportationParams: TransportationParam[]; // selected transportation params ('WALK', 'BICYCLE', 'CAR')

  @Prop({ type: Array })
  preferredLocations?: ApiPreferredLocation[]; // important places

  @Prop({ type: Array })
  routes?: EntityRoute[]; // routes to important places by foot, bicycle or car

  @Prop({ type: Array })
  transitRoutes?: EntityTransitRoute[]; // routes to important places by city transport
}

export const SnapshotDataSchema = SchemaFactory.createForClass(SnapshotData);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, PopulatedDoc, Document } from 'mongoose';

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
import {
  RealEstateListing,
  RealEstateListingDocument,
} from '../../real-estate-listing/schema/real-estate-listing.schema';

type TPopulatedRealEstate = PopulatedDoc<
  Document<Types.ObjectId> & RealEstateListingDocument
>;

export interface ISnapshotDataSchema
  extends Omit<ApiSearchResultSnapshot, 'realEstate'> {
  realEstate?: TPopulatedRealEstate;
}

@Schema({ _id: false })
class SnapshotData implements ISnapshotDataSchema {
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

  @Prop({ type: Types.ObjectId, ref: RealEstateListing.name })
  realEstate?: TPopulatedRealEstate;

  @Prop({ type: Array })
  routes?: EntityRoute[]; // routes to important places by foot, bicycle or car

  @Prop({ type: Array })
  transitRoutes?: EntityTransitRoute[]; // routes to important places by city transport
}

export const SnapshotDataSchema = SchemaFactory.createForClass(SnapshotData);

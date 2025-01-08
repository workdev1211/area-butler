import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
} from '@area-butler-types/real-estate';
import { OsmName, TransportationParam } from '@area-butler-types/types';
import { foreignIdGetSet } from '../../shared/constants/schema';

export type PotentialCustomerDocument = HydratedDocument<PotentialCustomer>;

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class PotentialCustomer {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    ...foreignIdGetSet,
  })
  companyId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Array })
  preferredAmenities: OsmName[];

  @Prop({ type: Object })
  realEstateCharacteristics: ApiRealEstateCharacteristics;

  @Prop({ type: Object })
  realEstateCostStructure: ApiRealEstateCost;

  @Prop({ type: Array })
  routingProfiles: TransportationParam[];

  @Prop({ type: Array, default: [] })
  preferredLocations: ApiPreferredLocation[];
}

export const PotentialCustomerSchema =
  SchemaFactory.createForClass(PotentialCustomer);

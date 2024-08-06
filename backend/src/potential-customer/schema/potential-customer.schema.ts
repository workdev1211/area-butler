import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
} from '@area-butler-types/real-estate';
import { OsmName, TransportationParam } from '@area-butler-types/types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import { foreignIdGetSet } from '../../shared/constants/schema';

export type PotentialCustomerDocument = PotentialCustomer & Document;

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class PotentialCustomer {
  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  userId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: Array })
  routingProfiles: TransportationParam[];

  @Prop({ type: Array })
  preferredAmenities: OsmName[];

  @Prop({ type: Object })
  realEstateCharacteristics: ApiRealEstateCharacteristics;

  @Prop({ type: Object })
  realEstateCostStructure: ApiRealEstateCost;

  @Prop({ type: Array, default: [] })
  preferredLocations: ApiPreferredLocation[];

  @Prop({ type: IntegrationParamsSchema })
  integrationParams: IApiIntegrationParams;
}

export const PotentialCustomerSchema =
  SchemaFactory.createForClass(PotentialCustomer);

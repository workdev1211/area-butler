import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import { ApiLocationSearch } from '@area-butler-types/types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';
import { foreignIdGetSet } from '../../shared/constants/schema';

export type LocationSearchDocument = LocationSearch & Document;

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class LocationSearch {
  @Prop({ type: Object, required: true })
  locationSearch: ApiLocationSearch;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  // TODO check why do we need two "endsAt" fields - this one and inside the "locationSearch"
  // The end date of the Pay per Use map
  @Prop({ type: Date })
  endsAt?: Date;

  @Prop({ type: IntegrationParamsSchema })
  integrationParams?: IApiIntegrationParams;

  @Prop({ type: Boolean })
  isTrial?: boolean;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  userId?: string;
}

export const LocationSearchSchema =
  SchemaFactory.createForClass(LocationSearch);

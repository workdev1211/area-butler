import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ApiSearch } from '@area-butler-types/types';
import { IntegrationParamsSchema } from '../../shared/integration-params.schema';
import { IApiIntegrationParams } from '@area-butler-types/integration';

export type LocationSearchDocument = LocationSearch & Document;

@Schema()
export class LocationSearch {
  @Prop()
  userId: string;

  @Prop({ type: Object })
  locationSearch: ApiSearch;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  // TODO check why do we need two "endsAt" fields - this one and inside the "locationSearch"
  // The end date of the Pay per Use map
  @Prop({ type: Date })
  endsAt: Date;

  @Prop({ type: IntegrationParamsSchema })
  integrationParams: IApiIntegrationParams;

  @Prop({ default: false })
  isTrial: boolean;
}

export const LocationSearchSchema =
  SchemaFactory.createForClass(LocationSearch);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  IApiIntegrationParams,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';

@Schema({ _id: false })
export class IntegrationParams implements IApiIntegrationParams {
  @Prop({ required: true })
  integrationId: string;

  @Prop({ required: true })
  integrationUserId: string;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;
}

export const IntegrationParamsSchema =
  SchemaFactory.createForClass(IntegrationParams);

IntegrationParamsSchema.index(
  { integrationId: 1, integrationUserId: 1, integrationType: 1 },
  { unique: true, sparse: true },
);

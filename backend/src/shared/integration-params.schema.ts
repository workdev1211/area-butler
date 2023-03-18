import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  IApiIntegrationParams,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';

@Schema({ _id: false })
export class IntegrationParams implements IApiIntegrationParams {
  @Prop({ type: String })
  integrationId: string;

  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;
}

export const IntegrationParamsSchema =
  SchemaFactory.createForClass(IntegrationParams);

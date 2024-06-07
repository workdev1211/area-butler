import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  IApiIntegrationParams,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';

@Schema({ _id: false })
class IntegrationParams implements IApiIntegrationParams {
  @Prop({ type: String, enum: IntegrationTypesEnum, required: true })
  integrationType: IntegrationTypesEnum;

  @Prop({ type: String, required: true })
  integrationUserId: string;

  @Prop({ type: String })
  integrationId?: string;
}

export const IntegrationParamsSchema =
  SchemaFactory.createForClass(IntegrationParams);

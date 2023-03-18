import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  IApiRealEstateIntegrationParams,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';

@Schema({ _id: false })
export class RealEstateIntegrationParams
  implements IApiRealEstateIntegrationParams
{
  @Prop({ required: true, type: String })
  integrationId: string;

  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;
}

export const RealEstateIntegrationParamsSchema = SchemaFactory.createForClass(
  RealEstateIntegrationParams,
);

RealEstateIntegrationParamsSchema.index(
  { integrationId: 1, integrationUserId: 1, integrationType: 1 },
  { unique: true, sparse: true },
);

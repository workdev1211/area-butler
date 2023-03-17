import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  TApiIntegrationUserConfig,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProductContingents,
  TApiIntegrationUserProductsUsed,
  TApiIntegrationUserUsageStatistics,
} from '@area-butler-types/integration-user';

export type TIntegrationUserDocument = IntegrationUser & Document;

@Schema({ timestamps: true })
export class IntegrationUser {
  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ type: Object })
  parameters: TApiIntegrationUserParameters;

  @Prop({ type: Object })
  config: TApiIntegrationUserConfig;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: Object })
  productsUsed: TApiIntegrationUserProductsUsed;

  @Prop({ type: Object })
  productContingents: TApiIntegrationUserProductContingents;

  @Prop({ type: Object })
  usageStatistics: TApiIntegrationUserUsageStatistics;
}

export const IntegrationUserSchema =
  SchemaFactory.createForClass(IntegrationUser);

IntegrationUserSchema.index(
  { integrationUserId: 1, integrationType: 1 },
  { unique: true },
);

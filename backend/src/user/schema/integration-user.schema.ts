import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  IntegrationTypesEnum,
  TApiIntegrationUserConfig,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProductContingents,
  TApiIntegrationUserProductsUsed,
  TApiIntegrationUserUsageStatistics,
} from '@area-butler-types/types';

export type TIntegrationUserDocument = IntegrationUser & Document;

@Schema()
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

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const IntegrationUserSchema =
  SchemaFactory.createForClass(IntegrationUser);

IntegrationUserSchema.index(
  { integrationUserId: 1, integrationType: 1 },
  { unique: true },
);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IApiIntegrationUserSchema,
  TApiIntegrationUserConfig,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProductContingents,
  TApiIntegrationUserProductsUsed,
} from '@area-butler-types/integration-user';

export type TIntegrationUserDocument = IntegrationUser &
  Document & { parentUser?: TIntegrationUserDocument };

@Schema({ timestamps: true })
export class IntegrationUser implements IApiIntegrationUserSchema {
  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ type: String, unique: true })
  accessToken: string;

  @Prop({ type: Object })
  parameters: TApiIntegrationUserParameters;

  @Prop({ type: Object })
  config: TApiIntegrationUserConfig;

  @Prop({ type: Object })
  productsUsed: TApiIntegrationUserProductsUsed;

  @Prop({ type: Object })
  productContingents: TApiIntegrationUserProductContingents;

  @Prop({ type: String })
  parentId: string;

  @Prop({ type: Boolean })
  isParent: boolean;
}

export const IntegrationUserSchema =
  SchemaFactory.createForClass(IntegrationUser);

IntegrationUserSchema.index(
  { integrationUserId: 1, integrationType: 1 },
  { unique: true },
);

IntegrationUserSchema.index({ updatedAt: -1 });

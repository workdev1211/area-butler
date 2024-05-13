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
  accessToken: string; // for AreaButler internal identification purposes

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ type: Object })
  config?: TApiIntegrationUserConfig;

  @Prop({ type: Boolean })
  isParent?: boolean;

  @Prop({ type: Object })
  parameters?: TApiIntegrationUserParameters;

  @Prop({ type: String })
  parentId?: string;

  @Prop({ type: Object })
  productContingents?: TApiIntegrationUserProductContingents;

  @Prop({ type: Object })
  productsUsed?: TApiIntegrationUserProductsUsed;
}

export const IntegrationUserSchema =
  SchemaFactory.createForClass(IntegrationUser);

IntegrationUserSchema.index(
  { integrationType: 1, integrationUserId: 1 },
  { unique: true },
);

IntegrationUserSchema.index(
  { integrationType: 1, accessToken: 1 },
  { unique: true },
);

IntegrationUserSchema.index({ updatedAt: -1 });

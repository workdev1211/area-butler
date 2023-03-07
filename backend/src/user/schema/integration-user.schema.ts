import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  IntegrationTypesEnum,
  TApiIntegrationUserParameters,
} from '@area-butler-types/types';

export type TIntegrationUserDocument = IntegrationUser & Document;

@Schema()
export class IntegrationUser {
  @Prop({ required: true })
  integrationUserId: string;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ type: Object })
  parameters: TApiIntegrationUserParameters;

  @Prop()
  userId: string;

  @Prop({ type: Date })
  consentGiven: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const IntegrationUserSchema =
  SchemaFactory.createForClass(IntegrationUser);

IntegrationUserSchema.index(
  { integrationUserId: 1, integrationType: 1 },
  { unique: true },
);

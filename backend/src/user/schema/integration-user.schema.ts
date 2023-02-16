import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ApiUserIntegrationTypesEnum } from '@area-butler-types/types';

export type IntegrationUserDocument = IntegrationUser & Document;

@Schema()
export class IntegrationUser {
  @Prop({ required: true })
  integrationUserId: string;

  @Prop({ required: true, type: String, enum: ApiUserIntegrationTypesEnum })
  integrationType: ApiUserIntegrationTypesEnum;

  @Prop({ type: Object })
  parameters: unknown;

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

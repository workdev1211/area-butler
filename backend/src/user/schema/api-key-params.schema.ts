import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  ApiFeatureTypesEnum,
  IApiKeyParams,
} from '@area-butler-types/external-api';

@Schema({ _id: false })
export class ApiKeyParams implements IApiKeyParams {
  @Prop({ required: true, type: String })
  apiKey: string;

  @Prop({ required: true, type: Array, default: [] })
  allowedFeatures: ApiFeatureTypesEnum[];
}

export const ApiKeyParamsSchema = SchemaFactory.createForClass(ApiKeyParams);

ApiKeyParamsSchema.index({ apiKey: 1 }, { unique: true, sparse: true });

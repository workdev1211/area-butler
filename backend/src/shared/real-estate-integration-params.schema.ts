import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  IApiRealEstateIntegrationParams,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';

// TODO Requires a refactoring. All integration specific fields should be moved under the productFeatures field
// and extracted based on the integration type.

// TODO iframeEndsAt field should be present here because of several snapshots can exist per address.

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

  @Prop({ type: Number })
  openAiRequestQuantity: number;

  // TODO a blank for the future
  @Prop({ type: Date })
  iframeEndsAt: Date;

  @Prop({ type: Boolean })
  isOnePageExportActive: boolean;

  @Prop({ type: Boolean })
  isStatsFullExportActive: boolean;
}

export const RealEstateIntegrationParamsSchema = SchemaFactory.createForClass(
  RealEstateIntegrationParams,
);

RealEstateIntegrationParamsSchema.index(
  { integrationId: 1, integrationUserId: 1, integrationType: 1 },
  { unique: true, sparse: true },
);

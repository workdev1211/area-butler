import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  IApiUsageStatisticsSchema,
  TApiUsageStatistics,
} from '@area-butler-types/types';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

export type UsageStatisticsDocument = UsageStatistics & Document;

@Schema()
export class UsageStatistics implements IApiUsageStatisticsSchema {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ type: String, default: dayjs().date().toString() })
  timestamp: string;

  @Prop({ type: Object })
  statistics: TApiUsageStatistics;
}

export const UsageStatisticsSchema =
  SchemaFactory.createForClass(UsageStatistics);

UsageStatisticsSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

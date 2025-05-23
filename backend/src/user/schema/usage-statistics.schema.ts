import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as dayjs from 'dayjs';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IApiUsageStatisticsSchema,
  TApiUsageStatistics,
} from '../../shared/types/external-api';

export type UsageStatisticsDocument = UsageStatistics & Document;

@Schema()
export class UsageStatistics implements IApiUsageStatisticsSchema {
  @Prop({ type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ type: Object })
  statistics: TApiUsageStatistics;

  @Prop({ type: String, default: dayjs().date().toString() })
  timestamp: string;

  @Prop({ type: String, required: true })
  userId: string;
}

export const UsageStatisticsSchema =
  SchemaFactory.createForClass(UsageStatistics);

UsageStatisticsSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import * as dayjs from 'dayjs';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IApiUsageStatisticsSchema,
  TApiUsageStatistics,
} from '../../shared/types/external-api';
import { foreignIdGetSet } from '../../shared/constants/schema';

export type UsageStatisticsDocument = UsageStatistics & Document;

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class UsageStatistics implements IApiUsageStatisticsSchema {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    ...foreignIdGetSet,
  })
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

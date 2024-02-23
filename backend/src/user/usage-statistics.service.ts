import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

import { UserDocument } from './schema/user.schema';
import {
  UsageStatistics,
  UsageStatisticsDocument,
} from './schema/usage-statistics.schema';
import { TIntegrationUserDocument } from './schema/integration-user.schema';
import { TApiIntUserUsageStatsTypes } from '@area-butler-types/integration-user';
import {
  ApiUsageStatsTypesEnum,
  TApiUsageStatsReqStatus,
} from '../shared/types/external-api';

@Injectable()
export class UsageStatisticsService {
  constructor(
    @InjectModel(UsageStatistics.name)
    private readonly usageStatisticsModel: Model<UsageStatisticsDocument>,
  ) {}

  async logUsageStatistics(
    user: UserDocument | TIntegrationUserDocument,
    statsType: ApiUsageStatsTypesEnum | TApiIntUserUsageStatsTypes,
    requestStatus: TApiUsageStatsReqStatus,
  ): Promise<void> {
    const currentDate = dayjs();
    const isIntegrationUser = 'integrationUserId' in user;

    const filter: {
      userId: string;
      timestamp: string;
      integrationType?: string;
    } = {
      userId: isIntegrationUser ? user.integrationUserId : user.id,
      timestamp: currentDate.format('YYYY-MM-DD'),
    };

    if (isIntegrationUser) {
      filter.integrationType = user.integrationType;
    }

    await this.usageStatisticsModel.updateOne(
      filter,
      {
        $push: {
          [`statistics.${statsType}`]: {
            timestamp: currentDate.toISOString(),
            ...requestStatus,
          },
        },
      },
      { upsert: true, omitUndefined: true },
    );
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubscriptionListener } from './subscription.listener';
import { User, UserSchema } from './schema/user.schema';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { Subscription, SubscriptionSchema } from './schema/subscription.schema';
import { SubscriptionService } from './service/subscription.service';
import { ClientModule } from '../client/client.module';
import {
  IntegrationUser,
  IntegrationUserSchema,
} from './schema/integration-user.schema';
import { IntegrationUserService } from './service/integration-user.service';
import { IntegrationUserController } from './controller/integration-user.controller';
import { UsageStatisticsService } from './service/usage-statistics.service';
import {
  UsageStatistics,
  UsageStatisticsSchema,
} from './schema/usage-statistics.schema';
import { ContingentIntService } from './service/contingent-int.service';
import { ConvertIntUserService } from './service/convert-int-user.service';

@Module({
  imports: [
    ClientModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      { name: IntegrationUser.name, schema: IntegrationUserSchema },
      {
        name: UsageStatistics.name,
        schema: UsageStatisticsSchema,
      },
    ]),
  ],
  controllers: [UserController, IntegrationUserController],
  providers: [
    ContingentIntService,
    ConvertIntUserService,
    IntegrationUserService,
    SubscriptionService,
    SubscriptionListener,
    UsageStatisticsService,
    UserService,
  ],
  exports: [
    ContingentIntService,
    ConvertIntUserService,
    IntegrationUserService,
    SubscriptionService,
    UsageStatisticsService,
    UserService,
  ],
})
export class UserModule {}

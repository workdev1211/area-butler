import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubscriptionListener } from './listener/subscription.listener';
import { User, UserSchema } from './schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Subscription, SubscriptionSchema } from './schema/subscription.schema';
import { SubscriptionService } from './subscription.service';
import { ClientModule } from '../client/client.module';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import {
  IntegrationUser,
  IntegrationUserSchema,
} from './schema/integration-user.schema';
import { IntegrationUserService } from './integration-user.service';
import { IntegrationUserController } from './integration-user.controller';
import { UsageStatisticsService } from './usage-statistics.service';
import {
  UsageStatistics,
  UsageStatisticsSchema,
} from './schema/usage-statistics.schema';
import { ContingentIntService } from './contingent-int.service';

@Module({
  imports: [
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
    ClientModule,
  ],
  providers: [
    ContingentIntService,
    IntegrationUserService,
    SubscriptionService,
    SubscriptionListener,
    UsageStatisticsService,
    UserService,
    UserSubscriptionPipe,
  ],
  exports: [
    ContingentIntService,
    IntegrationUserService,
    SubscriptionService,
    UsageStatisticsService,
    UserService,
  ],
  controllers: [UserController, IntegrationUserController],
})
export class UserModule {}

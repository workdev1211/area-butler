import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

import { ApiTourNamesEnum, ApiUser } from '@area-butler-types/types';
import { mapSubscriptionToApiSubscription } from '../mapper/subscription.mapper';
import { SubscriptionService } from '../service/subscription.service';
import { UserService } from '../service/user.service';
import { ApiUserSubscription } from '@area-butler-types/subscription-plan';
import UpdateUserConfigDto from '../dto/update-user-config.dto';
import { InjectUser } from '../inject-user.decorator';
import { UserDocument } from '../schema/user.schema';
import { AuthenticatedController } from '../../shared/authenticated.controller';

@ApiTags('users')
@Controller('api/users')
export class UserController extends AuthenticatedController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
  ) {
    super();
  }

  @ApiProperty({ description: 'Get the current user subscriptions' })
  @Get('subscriptions')
  async fetchUserSubscriptions(
    @InjectUser() user: UserDocument,
  ): Promise<ApiUserSubscription[]> {
    return (
      await this.subscriptionService.fetchUserSubscriptions(
        user.parentId || user.id,
      )
    ).map((subscription) => mapSubscriptionToApiSubscription(subscription));
  }

  @ApiProperty({ description: 'Cancel trial subscription' })
  @Delete('cancel-trial')
  async cancelTrialSubscription(
    @InjectUser() user: UserDocument,
  ): Promise<ApiUser> {
    // TODO think about creating a trial service
    await this.subscriptionService.removeTrialSubscription(user.id);
    return this.userService.convertDocToApiUser(user);
  }

  @ApiProperty({ description: 'Update current user config' })
  @Patch('config')
  async updateConfig(
    @InjectUser() user: UserDocument,
    @Body() config: UpdateUserConfigDto,
  ): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.updateConfig(user, config),
    );
  }

  @ApiProperty({ description: 'Hide single tour for current user' })
  @Patch('hide-tour/:tour')
  async hideTour(
    @InjectUser() user: UserDocument,
    @Param('tour') tour: ApiTourNamesEnum,
  ): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.hideTour(user, tour),
    );
  }

  @ApiProperty({ description: 'Hide tours for current user' })
  @Patch('hide-tour')
  async hideAllTours(@InjectUser() user: UserDocument): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.hideTour(user),
    );
  }
}

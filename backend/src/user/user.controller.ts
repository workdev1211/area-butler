import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ApiTourNamesEnum, ApiUser } from '@area-butler-types/types';
import { mapSubscriptionToApiSubscription } from './mapper/subscription.mapper';
import { SubscriptionService } from './subscription.service';
import { UserService } from './user.service';
import { ApiUserSubscription } from '@area-butler-types/subscription-plan';
import ApiUserSettingsDto from '../dto/api-user-settings.dto';

interface IUserRequest extends Request {
  user: { email: string };
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/users')
@UseGuards(AuthGuard('auth0-spa'))
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @ApiProperty({ description: 'Get the current user' })
  @Get('login')
  async login(@Req() { user: { email } }: IUserRequest): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.upsertUser(email, email),
    );
  }

  @ApiProperty({ description: 'Get the current user subscriptions' })
  @Get('subscriptions')
  async fetchUserSubscriptions(
    @Req() { user: { email } }: IUserRequest,
  ): Promise<ApiUserSubscription[]> {
    const user = await this.userService.upsertUser(email, email);

    return (
      await this.subscriptionService.fetchUserSubscriptions(
        user.parentId || user.id,
      )
    ).map((subscription) => mapSubscriptionToApiSubscription(subscription));
  }

  @ApiProperty({ description: 'Cancel trial subscription' })
  @Delete('cancel-trial')
  async cancelTrialSubscription(
    @Req() { user: { email } }: IUserRequest,
  ): Promise<ApiUser> {
    const user = await this.userService.upsertUser(email, email);

    // TODO think about creating a trial service
    await this.subscriptionService.removeTrialSubscription(user.id);

    return this.userService.convertDocToApiUser(user);
  }

  @ApiProperty({ description: 'Update current user config' })
  @Patch('config')
  async config(
    @Req() { user: { email } }: IUserRequest,
    @Body() config: ApiUserSettingsDto,
  ): Promise<ApiUser> {
    if (config.logo) {
      this.checkMimeType(config.logo);
    }

    if (config.mapIcon) {
      this.checkMimeType(config.mapIcon);
    }

    return this.userService.convertDocToApiUser(
      await this.userService.updateConfig(email, config),
    );
  }

  @ApiProperty({ description: 'Set consent for the current user' })
  @Post('consent')
  async giveConsent(
    @Req() { user: { email } }: IUserRequest,
  ): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.giveConsent(email),
    );
  }

  @ApiProperty({ description: 'Hide single tour for current user' })
  @Post('hide-tour/:tour')
  async hideTour(
    @Req() { user: { email } }: IUserRequest,
    @Param('tour') tour: ApiTourNamesEnum,
  ): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.hideTour(email, tour),
    );
  }

  @ApiProperty({ description: 'Hide tours for current user' })
  @Post('hide-tour')
  async hideAllTours(
    @Req() { user: { email } }: IUserRequest,
  ): Promise<ApiUser> {
    return this.userService.convertDocToApiUser(
      await this.userService.hideTour(email),
    );
  }

  private checkMimeType(base64EncodedImage: string): void {
    const mimeInfo = base64EncodedImage.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];

    if (!mimeInfo.includes('image/')) {
      throw new HttpException('Unsupported mime type', HttpStatus.BAD_REQUEST);
    }
  }
}

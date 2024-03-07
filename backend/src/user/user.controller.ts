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
import { plainToInstance } from 'class-transformer';

import { ApiTourNamesEnum } from '@area-butler-types/types';
import { mapSubscriptionToApiSubscription } from './mapper/subscription.mapper';
import { SubscriptionService } from './subscription.service';
import { UserService } from './user.service';
import ApiUserDto from './dto/api-user.dto';
import ApiUserSubscriptionDto from './dto/api-user-subscription.dto';
import ApiUpsertUserDto from '../dto/api-upsert-user.dto';
import ApiUserSettingsDto from '../dto/api-user-settings.dto';
import { UserDocument } from './schema/user.schema';

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
  @Get('me')
  async me(@Req() request): Promise<ApiUserDto> {
    const requestUser = request?.user;

    const user = await this.userService.upsertUser(
      requestUser.email,
      requestUser.email,
      true,
    );

    return this.transformToApiUser(user);
  }

  @ApiProperty({ description: 'Get the current user subscriptions' })
  @Get('me/subscriptions')
  async fetchUserSubscriptions(
    @Req() request,
  ): Promise<ApiUserSubscriptionDto[]> {
    const requestUser = request?.user;

    const user = await this.userService.upsertUser(
      requestUser.email,
      requestUser.email,
    );

    return (
      await this.subscriptionService.fetchUserSubscriptions(
        user.parentId || user.id,
      )
    ).map((s) => mapSubscriptionToApiSubscription(s));
  }

  @ApiProperty({ description: 'Cancel trial subscription' })
  @Delete('me/cancel-trial')
  async cancelTrialSubscription(@Req() request): Promise<ApiUserDto> {
    const requestUser = request?.user;

    const user = await this.userService.upsertUser(
      requestUser.email,
      requestUser.email,
    );

    // TODO think about creating a trial service
    await this.subscriptionService.removeTrialSubscription(user.id);

    return this.transformToApiUser(user);
  }

  @ApiProperty({ description: 'Update the current user' })
  @Post('me')
  async patch(
    @Req() request,
    @Body() upsertUser: ApiUpsertUserDto,
  ): Promise<ApiUserDto> {
    const requestUser = request?.user;

    const user = await this.userService.patchUser(
      requestUser.email,
      upsertUser,
    );

    return this.transformToApiUser(user);
  }

  @ApiProperty({ description: 'Update the current user settings' })
  @Patch('me/settings')
  async settings(
    @Req() request,
    @Body() settings: ApiUserSettingsDto,
  ): Promise<ApiUserDto> {
    if (settings.logo) {
      this.checkMimeType(settings.logo);
    }

    if (settings.mapIcon) {
      this.checkMimeType(settings.mapIcon);
    }

    const user = await this.userService.updateSettings(
      request?.user?.email,
      settings,
    );

    return this.transformToApiUser(user);
  }

  private checkMimeType(base64EncodedImage: string): void {
    const mimeInfo = base64EncodedImage.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];

    if (!mimeInfo.includes('image/')) {
      throw new HttpException('Unsupported mime type', HttpStatus.BAD_REQUEST);
    }
  }

  @ApiProperty({ description: 'Set consent for the current user' })
  @Post('me/consent')
  async giveConsent(@Req() request): Promise<ApiUserDto> {
    const requestUser = request?.user;
    const user = await this.userService.giveConsent(requestUser.email);

    return this.transformToApiUser(user);
  }

  @ApiProperty({ description: 'Hide single tour for current user' })
  @Post('me/hide-tour/:tour')
  async hideTour(
    @Req() request,
    @Param('tour') tour: ApiTourNamesEnum,
  ): Promise<ApiUserDto> {
    const requestUser = request?.user;
    const user = await this.userService.hideTour(requestUser.email, tour);

    return this.transformToApiUser(user);
  }

  @ApiProperty({ description: 'Hide tours for current user' })
  @Post('me/hide-tour')
  async hideAllTours(@Req() request): Promise<ApiUserDto> {
    const requestUser = request?.user;
    const user = await this.userService.hideTour(requestUser.email);

    return this.transformToApiUser(user);
  }

  private async transformToApiUser(user: UserDocument): Promise<ApiUserDto> {
    if (user.parentId && !user.parentUser) {
      user.parentUser = await this.userService.findById({
        userId: user.parentId,
        withAssets: true,
        withSubscription: true,
      });
    }

    if (
      user.parentUser &&
      (!user.subscription ||
        user.subscription.id !== user.parentUser.subscription?.id)
    ) {
      user.subscription = user.parentUser.subscription;
    }

    if (!user.subscription && !user.parentUser) {
      user.subscription = await this.subscriptionService.findActiveByUserId(
        user.id,
      );
    }

    return plainToInstance(ApiUserDto, user, { exposeUnsetFields: false });
  }
}

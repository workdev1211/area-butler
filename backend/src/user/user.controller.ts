import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';

import { ApiTour } from '@area-butler-types/types';
import { mapSubscriptionToApiSubscription } from './mapper/subscription.mapper';
import { mapUserToApiUser } from './mapper/user.mapper';
import { SubscriptionService } from './subscription.service';
import { UserService } from './user.service';
import ApiUserDto from '../dto/api-user.dto';
import ApiUserSubscriptionDto from '../dto/api-user-subscription.dto';
import ApiUpsertUserDto from '../dto/api-upsert-user.dto';
import ApiUserSettingsDto from '../dto/api-user-settings.dto';
import { InjectUser } from './inject-user.decorator';
import { UserDocument } from './schema/user.schema';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
  ) {}

  @ApiProperty({ description: 'Get the current user' })
  @Get('me')
  async me(@Req() request): Promise<ApiUserDto> {
    const requestUser = request?.user;

    const user = await this.userService.upsertUser(
      requestUser.email,
      requestUser.email,
    );

    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }

  @ApiProperty({ description: 'Get the current users subscriptions' })
  @Get('me/subscriptions')
  async allSubscriptions(@Req() request): Promise<ApiUserSubscriptionDto[]> {
    const requestUser = request?.user;

    const user = await this.userService.upsertUser(
      requestUser.email,
      requestUser.email,
    );

    return (
      await this.subscriptionService.fetchAllUserSubscriptions(user._id)
    ).map((s) => mapSubscriptionToApiSubscription(s));
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

    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }

  @ApiProperty({ description: 'Update the current user settings' })
  @Post('me/settings')
  async settings(
    @InjectUser(UserSubscriptionPipe) user: UserDocument,
    @Body() settings: ApiUserSettingsDto,
  ): Promise<ApiUserDto> {
    if (settings.logo) {
      this.checkMimeType(settings.logo);
    }

    if (settings.mapIcon) {
      this.checkMimeType(settings.mapIcon);
    }

    await this.userService.updateSettings(user, settings);

    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
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

    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }

  @ApiProperty({ description: 'Hide tours for current user' })
  @Post('me/hide-tour')
  public async hideAllTours(@Req() request): Promise<ApiUserDto> {
    const requestUser = request?.user;
    const user = await this.userService.hideTour(requestUser.email);

    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }

  @ApiProperty({ description: 'Hide single tour for current user' })
  @Post('me/hide-tour/:tour')
  async hideTour(
    @Req() request,
    @Param('tour') tour: ApiTour,
  ): Promise<ApiUserDto> {
    const requestUser = request?.user;
    const user = await this.userService.hideTour(requestUser.email, tour);

    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }
}

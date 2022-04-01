import { ApiUserSubscription } from '@area-butler-types/subscription-plan';
import {
  ApiTour,
  ApiUpsertUser,
  ApiUser,
  ApiUserSettings,
} from '@area-butler-types/types';
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
import { mapSubscriptionToApiSubscription } from './mapper/subscription.mapper';
import { mapUserToApiUser } from './mapper/user.mapper';
import { SubscriptionService } from './subscription.service';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import ApiUserDto from '../dto/api-user.dto';
import ApiUserSubscriptionDto from '../dto/api-user-subscription.dto';
import ApiUpsertUserDto from '../dto/api-upsert-user.dto';
import ApiUserSettingsDto from '../dto/api-user-settings.dto';

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
  public async me(@Req() request): Promise<ApiUserDto> {
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
  public async allSubscriptions(
    @Req() request,
  ): Promise<ApiUserSubscriptionDto[]> {
    const requestUser = request?.user;
    const user = await this.userService.upsertUser(
      requestUser.email,
      requestUser.email,
    );
    return (await this.subscriptionService.allUserSubscriptions(user._id)).map(
      (s) => mapSubscriptionToApiSubscription(s),
    );
  }

  @ApiProperty({ description: 'Update the current user' })
  @Post('me')
  public async patch(
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
  public async settings(
    @Req() request,
    @Body() settings: ApiUserSettingsDto,
  ): Promise<ApiUserDto> {
    const requestUser = request?.user;

    if (settings.logo) {
      this.checkMimeType(settings.logo);
    }
    if (settings.mapIcon) {
      this.checkMimeType(settings.mapIcon);
    }
    const user = await this.userService.updateSettings(
      requestUser.email,
      settings,
    );

    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }

  private checkMimeType(base64EncodedImage: string) {
    const mimeInfo = base64EncodedImage.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
    if (!mimeInfo.includes('image/')) {
      throw new HttpException('Unsupported mime type', HttpStatus.BAD_REQUEST);
    }
  }

  @ApiProperty({ description: 'Set consent for the current user' })
  @Post('me/consent')
  public async giveConsent(@Req() request): Promise<ApiUserDto> {
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
  public async hideTour(
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

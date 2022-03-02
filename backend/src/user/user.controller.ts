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

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private userService: UserService,
    private subscriptionService: SubscriptionService,
  ) {}

  @Get('me')
  public async me(@Req() request): Promise<ApiUser> {
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

  @Get('me/subscriptions')
  public async allSubscriptions(
    @Req() request,
  ): Promise<ApiUserSubscription[]> {
    const requestUser = request?.user;
    const user = await this.userService.upsertUser(
      requestUser.email,
      requestUser.email,
    );
    return (
      await this.subscriptionService.allUserSubscriptions(user._id)
    ).map(s => mapSubscriptionToApiSubscription(s));
  }

  @Post('me')
  public async patch(
    @Req() request,
    @Body() upsertUser: ApiUpsertUser,
  ): Promise<ApiUser> {
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

  @Post('me/settings')
  public async settings(
    @Req() request,
    @Body() settings: ApiUserSettings,
  ): Promise<ApiUser> {
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

  @Post('me/consent')
  public async giveConsent(@Req() request): Promise<ApiUser> {
    const requestUser = request?.user;
    const user = await this.userService.giveConsent(requestUser.email);
    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }

  @Post('me/hide-tour')
  public async hideAllTours(@Req() request) {
    const requestUser = request?.user;
    const user = await this.userService.hideTour(requestUser.email);
    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }

  @Post('me/hide-tour/:tour')
  public async hideTour(@Req() request, @Param('tour') tour: ApiTour) {
    const requestUser = request?.user;
    const user = await this.userService.hideTour(requestUser.email, tour);
    return mapUserToApiUser(
      user,
      await this.subscriptionService.findActiveByUserId(user._id),
    );
  }
}

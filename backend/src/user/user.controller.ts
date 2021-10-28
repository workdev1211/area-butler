import {ApiUpsertUser, ApiUser} from '@area-butler-types/types';
import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {mapUserToApiUser} from './mapper/user.mapper';
import {UserService} from './user.service';
import {SubscriptionService} from "./subscription.service";
import { mapSubscriptionToApiSubscription } from './mapper/subscription.mapper';
import { ApiUserSubscription } from '@area-butler-types/subscription-plan';

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private userService: UserService, private subscriptionService: SubscriptionService) {
    }

    @Get('me')
    public async me(@Req() request): Promise<ApiUser> {
        const requestUser = request?.user;
        const user = await this.userService.upsertUser(requestUser.email, requestUser.email);
        return mapUserToApiUser(
            user,
            await this.subscriptionService.findActiveByUserId(user._id)
        );
    }

    @Get('me/subscriptions')
    public async allSubscriptions(@Req() request): Promise<ApiUserSubscription[]> {
        const requestUser = request?.user;
        const user = await this.userService.upsertUser(requestUser.email, requestUser.email);
        return (await this.subscriptionService.allUserSubscriptions(user._id)).map(s => mapSubscriptionToApiSubscription(s));
    }

    @Post('me')
    public async patch(@Req() request, @Body() upsertUser: ApiUpsertUser): Promise<ApiUser> {
        const requestUser = request?.user;
        const user = await this.userService.patchUser(requestUser.email, upsertUser)
        return mapUserToApiUser(
            user,
            await this.subscriptionService.findActiveByUserId(user._id)
        );
    }

    @Post('me/consent')
    public async giveConsent(@Req() request): Promise<ApiUser> {
        const requestUser = request?.user;
        const user = await this.userService.giveConsent(requestUser.email)
        return mapUserToApiUser(
            user,
            await this.subscriptionService.findActiveByUserId(user._id)
        );
    }

}

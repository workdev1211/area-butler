import {ApiConsent, ApiInviteCode, ApiTour, ApiUpsertUser, ApiUser} from '@area-butler-types/types';
import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {mapUserToApiUser} from './mapper/user.mapper';
import {UserService} from './user.service';
import {SubscriptionService} from "./subscription.service";
import { mapSubscriptionToApiSubscription } from './mapper/subscription.mapper';
import { ApiUserSubscription } from '@area-butler-types/subscription-plan';
import { InviteCodeService } from './invite-code.service';
import { mapInviteCodeToApiInvitecode } from './mapper/invite-code.mapper';

@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private userService: UserService, private subscriptionService: SubscriptionService, private inviteCodeService: InviteCodeService) {
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
    public async giveConsent(@Req() request, @Body() apiConsent: ApiConsent): Promise<ApiUser> {
        const requestUser = request?.user;
        const user = await this.userService.giveConsent(requestUser.email, apiConsent)
        return mapUserToApiUser(
            user,
            await this.subscriptionService.findActiveByUserId(user._id)
        );
    }

    @Post('me/hide-tour')
    public async hideAllTours(@Req() request) {
        const requestUser = request?.user;
        const user = await this.userService.hideTour(requestUser.email);
        return mapUserToApiUser(
            user,
            await this.subscriptionService.findActiveByUserId(user._id)
        );
    }


    @Post('me/hide-tour/:tour')
    public async hideTour(@Req() request, @Param('tour') tour: ApiTour) {
        const requestUser = request?.user;
        const user = await this.userService.hideTour(requestUser.email, tour);
        return mapUserToApiUser(
            user,
            await this.subscriptionService.findActiveByUserId(user._id)
        );
    }

    @Get('me/invite-codes')
    public async fetchUserInviteCodes(@Req() request): Promise<ApiInviteCode[]> {
        const requestUser = request?.user;
        const user = await this.userService.upsertUser(requestUser.email, requestUser.email);
        return (await this.inviteCodeService.fetchInviteCodes(user._id)).map(code => mapInviteCodeToApiInvitecode(code));
    }

}

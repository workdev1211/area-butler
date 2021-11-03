import {Body, Controller, HttpException, Post, Req} from '@nestjs/common';
import {InviteCodeService} from './invite-code.service';
import {ApiConsent} from "@area-butler-types/types";

@Controller('api/invite-code')
export class InviteCodeController {
    constructor(private inviteCodeService: InviteCodeService) {
    }

    @Post()
    public async validateCode(@Req() request, @Body() consent: ApiConsent): Promise<boolean> {
        const exists = await this.inviteCodeService.validateInviteCode(consent.inviteCode);
        if (!exists) {
            throw new HttpException('Unknown invitation code', 400);
        }
        return true;
    }

}

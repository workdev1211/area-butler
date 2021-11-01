import { ApiInviteCode } from "@area-butler-types/types";
import { InviteCode } from "../schema/invite-code.schema";

export const mapInviteCodeToApiInvitecode = (inviteCode: InviteCode): ApiInviteCode => ({
    code: inviteCode.code,
    used: inviteCode.used
});
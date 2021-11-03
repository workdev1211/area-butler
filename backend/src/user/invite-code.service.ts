import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { InviteCode, InviteCodeDocument } from "./schema/invite-code.schema";
const crypto = require('crypto');

@Injectable()
export class InviteCodeService {

    private numberOfInviteCodes = 5;

    constructor(
        @InjectModel(InviteCode.name) private inviteCodeModel: Model<InviteCodeDocument>,
    ) {}

    public async fetchInviteCodes(userId: string): Promise<InviteCodeDocument[]> {

        const inviteCodes: InviteCodeDocument[] = await this.inviteCodeModel.find({userId});
        
        if (!inviteCodes || inviteCodes.length === 0) {
            for(const _ of Array(this.numberOfInviteCodes).fill(0)) {
                inviteCodes.push(await this.createInviteCode(userId));
            }
        }

        return inviteCodes;
    }

    public async createInviteCode(userId: string): Promise<InviteCodeDocument> {

        let code = crypto.randomBytes(20).toString('hex').toUpperCase();

        while (await this.inviteCodeModel.exists({code})) {
            code = crypto.randomBytes(20).toString('hex').toUpperCase();
        }

        return await new this.inviteCodeModel({userId, code}).save();
    }

    public async consumeInviteCode(code: string): Promise<InviteCodeDocument> {
        if (!code) {
            throw new HttpException('Code is empty', 400);
        }

        const inviteCode = await this.inviteCodeModel.findOne({code: code.toUpperCase()});

        if (!inviteCode) {
            throw new HttpException('Unknown Invite Code', 400);
        }

        if (!!inviteCode.used) {
            throw new HttpException('Invite Code already used', 400);
        }

        inviteCode.used = new Date();

        return await inviteCode.save();
    }

}
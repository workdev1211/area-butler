import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type InviteCodeDocument = InviteCode & Document;

@Schema()
export class InviteCode {

    @Prop({required: true})
    userId: string;

    @Prop({required: true})
    code: string;

    @Prop({required: false})
    used: Date

}

export const InviteCodeSchema = SchemaFactory.createForClass(InviteCode);
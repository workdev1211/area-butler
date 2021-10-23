import { ApiSubscriptionPlanType } from '@area-butler-types/subscription-plan';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, default: false })
  consentGiven: boolean;

  @Prop({
    type: String,
    enum: [ApiSubscriptionPlanType.STANDARD, ApiSubscriptionPlanType.PRO],
    default: ApiSubscriptionPlanType.STANDARD,
  })
  subscriptionPlan: ApiSubscriptionPlanType;

  @Prop({ type: Number, default: 0 })
  requestsExecuted: number;
}

export const Userschema = SchemaFactory.createForClass(User);

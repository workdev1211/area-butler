import {
  ApiRequestContingent,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
} from '@area-butler-types/subscription-plan';
import { HttpException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { allSubscriptions } from '../../../../shared/constants/subscription-plan';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  consentGiven: Date;

  @Prop({
    type: String,
    enum: [ApiSubscriptionPlanType.STANDARD, ApiSubscriptionPlanType.PRO],
    default: ApiSubscriptionPlanType.STANDARD,
  })
  subscriptionPlan: ApiSubscriptionPlanType;

  @Prop({ type: Number, default: 0 })
  requestsExecuted: number;

  @Prop({ type: Array, default: [] })
  requestContingents: ApiRequestContingent[];

}

export const checkSubscriptionViolation = (
  user: UserDocument,
  check: (subscription: ApiSubscriptionPlan) => boolean,
  message: string,
): void => {
  const userSubscription = allSubscriptions[user.subscriptionPlan];
  if (check(userSubscription)) {
    throw new HttpException(message, 400);
  }
};

export const Userschema = SchemaFactory.createForClass(User);

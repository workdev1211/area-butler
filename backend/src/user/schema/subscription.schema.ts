import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ApiSubscriptionPlanType } from '@area-butler-types/subscription-plan';

export type SubscriptionDocument = Subscription & Document;

@Schema()
export class Subscription {
  @Prop({
    type: String,
    required: true,
    enum: [
      ApiSubscriptionPlanType.PAY_PER_USE_1,
      ApiSubscriptionPlanType.PAY_PER_USE_5,
      ApiSubscriptionPlanType.PAY_PER_USE_10,
      ApiSubscriptionPlanType.BUSINESS_PLUS,
      ApiSubscriptionPlanType.BUSINESS_PLUS_V2,
    ],
  })
  type: ApiSubscriptionPlanType;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  endsAt: Date;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({ required: true })
  stripePriceId: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

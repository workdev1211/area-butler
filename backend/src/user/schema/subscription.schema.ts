import { ApiSubscriptionPlanType } from '@area-butler-types/subscription-plan';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema()
export class Subscription {
  @Prop({
    type: String,
    required: true,
    enum: [
      ApiSubscriptionPlanType.STANDARD,
      ApiSubscriptionPlanType.PRO,
      ApiSubscriptionPlanType.BUSINESS_PLUS,
      ApiSubscriptionPlanType.TRIAL,
    ],
  })
  type: ApiSubscriptionPlanType;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  endsAt: Date;

  @Prop({ type: Date, required: true })
  trialEndsAt: Date;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({ required: true })
  stripePriceId: string;
}

export const Subscriptionschema = SchemaFactory.createForClass(Subscription);

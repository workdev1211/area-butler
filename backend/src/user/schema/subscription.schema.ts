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

  // the id of the user specific subscription, not the product id from the Stripe dashboard
  @Prop()
  stripeSubscriptionId: string;

  @Prop()
  paypalSubscriptionId: string;

  @Prop({ required: true })
  stripePriceId: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

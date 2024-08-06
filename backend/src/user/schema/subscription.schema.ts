import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import {
  ApiSubscriptionPlanType,
  IApiSubscriptionPlanAppFeatures,
} from '@area-butler-types/subscription-plan';
import { foreignIdGetSet } from '../../shared/constants/schema';

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Subscription {
  @Prop({
    type: String,
    required: true,
    enum: ApiSubscriptionPlanType,
  })
  type: ApiSubscriptionPlanType;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    ...foreignIdGetSet,
  })
  userId: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  endsAt: Date;

  // TODO refactor to the usage of subscription id and payment system type / change the unique index appropriately
  // the id of the user specific subscription, not the product id from the Stripe dashboard
  @Prop({ type: String })
  stripeSubscriptionId: string;

  @Prop({ type: String })
  paypalSubscriptionId: string;

  // TODO refactor to the usage of the "type" parameter instead
  @Prop({ type: String, required: true })
  stripePriceId: string;

  @Prop({ type: Object })
  appFeatures: IApiSubscriptionPlanAppFeatures;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
export type SubscriptionDocument = Subscription & Document;

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, FilterQuery, SchemaTypes } from 'mongoose';

import { ApiRequestContingent } from '@area-butler-types/subscription-plan';
import { Subscription, SubscriptionDocument } from './subscription.schema';
import {
  COMPANY_PATH,
  foreignIdGetSet,
  PARENT_USER_PATH,
  SUBSCRIPTION_PATH,
} from '../../shared/constants/schema';
import { Company, TCompanyDocument } from '../../company/schema/company.schema';
import { UserConfigSchema } from './user-config.schema';
import { IUserConfig } from '@area-butler-types/user';
import { defaultUserConfig } from '../../../../shared/constants/user';

export type UserDocument = HydratedDocument<User>;

@Schema({
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class User {
  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    ...foreignIdGetSet,
  })
  companyId: string;

  @Prop({
    type: UserConfigSchema,
    default: { ...defaultUserConfig },
  })
  config: IUserConfig;

  @Prop({ type: Date })
  consentGiven: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String })
  paypalCustomerId: string;

  @Prop({ type: Array, default: [] })
  requestContingents: ApiRequestContingent[];

  @Prop({ type: Number, default: 0 })
  requestsExecuted: number;

  @Prop({ type: String })
  stripeCustomerId: string;

  company: TCompanyDocument;

  // OLD

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  parentId: string;

  parentUser: UserDocument;
  subscription: SubscriptionDocument;
}

export const retrieveTotalRequestContingent = (
  user: UserDocument,
  date: Date = new Date(),
): ApiRequestContingent[] => {
  const contingents = user.requestContingents || [];

  return contingents.filter(
    (c) =>
      c.date.getFullYear() < date.getFullYear() ||
      (c.date.getFullYear() === date.getFullYear() &&
        c.date.getMonth() <= date.getMonth()),
  );
};

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual(PARENT_USER_PATH, {
  ref: User.name,
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

UserSchema.virtual(COMPANY_PATH, {
  ref: Company.name,
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});

UserSchema.virtual(SUBSCRIPTION_PATH, {
  ref: Subscription.name,
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
  match: (): FilterQuery<SubscriptionDocument> => ({
    endsAt: { $gt: new Date() },
  }),
}).get(function (userSubscription: SubscriptionDocument): SubscriptionDocument {
  return this.parentUser?.subscription || userSubscription;
});

// Left as an example
// UserSchema.pre('save', function (this: UserDocument, next): void {
//   delete this.poiIcons;
//   next();
// });

import { ApiSubscriptionPlanType } from '@area-butler-types/subscription-plan';
import { ApiUser } from '@area-butler-types/types';
import { UserDocument } from '../schema/user.schema';

export const mapUserToApiUser = (user: UserDocument): ApiUser => ({
  fullname: user.fullname,
  email: user.email,
  subscriptionPlan: !!user.subscriptionPlan ? user.subscriptionPlan : ApiSubscriptionPlanType.STANDARD,
  requestsExecuted: user.requestsExecuted
});

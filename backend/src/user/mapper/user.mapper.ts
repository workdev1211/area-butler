import { ApiUser } from '@area-butler-types/types';
import { allSubscriptions } from '../../../../shared/constants/subscription-plan';
import { UserDocument } from '../schema/user.schema';

export const mapUserToApiUser = (user: UserDocument): ApiUser => ({
  fullname: user.fullname,
  email: user.email,
  subscriptionPlan: !!user.subscriptionPlan ? allSubscriptions[user.subscriptionPlan] : null,
  requestsExecuted: user.requestsExecuted,
  consentGiven: user.consentGiven,
  requestContingents: user.requestContingents
});

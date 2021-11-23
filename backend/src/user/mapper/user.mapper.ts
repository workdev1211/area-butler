import {ApiUser} from '@area-butler-types/types';
import {retrieveTotalRequestContingent, UserDocument} from '../schema/user.schema';
import {SubscriptionDocument} from "../schema/subscription.schema";
import {mapSubscriptionToApiSubscription} from "./subscription.mapper";

export const mapUserToApiUser = (user: UserDocument, subscription?: SubscriptionDocument): ApiUser => ({
  fullname: user.fullname,
  email: user.email,
  subscriptionPlan: subscription ? mapSubscriptionToApiSubscription(subscription) : null,
  requestsExecuted: user.requestsExecuted,
  consentGiven: user.consentGiven,
  requestContingents: retrieveTotalRequestContingent(user),
  showTour: user.showTour,
  logo: user.logo
});

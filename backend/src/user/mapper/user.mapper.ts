import {
  retrieveTotalRequestContingent,
  UserDocument,
} from '../schema/user.schema';
import { SubscriptionDocument } from '../schema/subscription.schema';
import { mapSubscriptionToApiSubscription } from './subscription.mapper';
import ApiUserDto from '../../dto/api-user.dto';

export const mapUserToApiUser = (
  user: UserDocument,
  subscription?: SubscriptionDocument,
): ApiUserDto => ({
  fullname: user.fullname,
  email: user.email,
  subscriptionPlan: subscription
    ? mapSubscriptionToApiSubscription(subscription)
    : null,
  requestsExecuted: user.requestsExecuted,
  consentGiven: user.consentGiven,
  requestContingents: retrieveTotalRequestContingent(user),
  showTour: user.showTour,
  logo: user.logo,
  mapIcon: user.mapIcon,
  color: user.color,
  additionalMapBoxStyles: user.additionalMapBoxStyles,
});

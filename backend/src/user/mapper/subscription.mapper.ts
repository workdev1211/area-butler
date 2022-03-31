import { SubscriptionDocument } from '../schema/subscription.schema';
import { allSubscriptions } from '../../../../shared/constants/subscription-plan';
import ApiUserSubscriptionDto from '../../dto/api-user-subscription.dto';

export const mapSubscriptionToApiSubscription = (
  subscription: SubscriptionDocument,
): ApiUserSubscriptionDto => ({
  type: subscription.type,
  createdAt: subscription.createdAt,
  endsAt: subscription.endsAt,
  trialEndsAt: subscription.trialEndsAt,
  config: allSubscriptions[subscription.type],
});

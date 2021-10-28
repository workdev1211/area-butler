import {SubscriptionDocument} from "../schema/subscription.schema";
import {ApiUserSubscription} from "@area-butler-types/subscription-plan";

export const mapSubscriptionToApiSubscription = (subscription: SubscriptionDocument): ApiUserSubscription => ({
  type: subscription.type,
  createdAt: subscription.createdAt,
  endsAt: subscription.endsAt,
  trialEndsAt: subscription.trialEndsAt
});

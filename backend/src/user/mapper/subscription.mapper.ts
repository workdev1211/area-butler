import { SubscriptionDocument } from '../schema/subscription.schema';
import { allSubscriptions } from '../../../../shared/constants/subscription-plan';
import ApiUserSubscriptionDto from '../dto/api-user-subscription.dto';
import { PaymentSystemTypeEnum } from '@area-butler-types/subscription-plan';

const getPaymentSystemType = (subscription: SubscriptionDocument) => {
  if (subscription.stripeSubscriptionId) {
    return PaymentSystemTypeEnum.STRIPE;
  }

  if (subscription.paypalSubscriptionId) {
    return PaymentSystemTypeEnum.PAYPAL;
  }
};

export const mapSubscriptionToApiSubscription = (
  subscription: SubscriptionDocument,
): ApiUserSubscriptionDto => {
  const subscriptionPlan = { ...allSubscriptions[subscription.type] };

  Object.keys(subscriptionPlan.appFeatures).forEach((key) => {
    if (subscription.appFeatures && subscription.appFeatures[key]) {
      subscriptionPlan.appFeatures[key] = subscription.appFeatures[key];
    }
  });

  return {
    type: subscription.type,
    paymentSystemType: getPaymentSystemType(subscription),
    createdAt: subscription.createdAt,
    endsAt: subscription.endsAt,
    priceId: subscription.stripePriceId,
    config: subscriptionPlan,
  };
};

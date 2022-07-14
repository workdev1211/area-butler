import { SubscriptionDocument } from '../schema/subscription.schema';
import { allSubscriptions } from '../../../../shared/constants/subscription-plan';
import ApiUserSubscriptionDto from '../../dto/api-user-subscription.dto';
import { PaymentSystemTypeEnum } from '@area-butler-types/subscription-plan';

const getPaymentSystemType = (subscription: SubscriptionDocument) => {
  if (subscription.stripeSubscriptionId) {
    return PaymentSystemTypeEnum.Stripe;
  }

  if (subscription.paypalSubscriptionId) {
    return PaymentSystemTypeEnum.PayPal;
  }
};

export const mapSubscriptionToApiSubscription = (
  subscription: SubscriptionDocument,
): ApiUserSubscriptionDto => ({
  type: subscription.type,
  paymentSystemType: getPaymentSystemType(subscription),
  createdAt: subscription.createdAt,
  endsAt: subscription.endsAt,
  priceId: subscription.stripePriceId,
  config: allSubscriptions[subscription.type],
});

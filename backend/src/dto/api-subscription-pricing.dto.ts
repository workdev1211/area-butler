import { ApiSubscriptionPricing } from '@area-butler-types/subscription-plan';

class ApiSubscriptionPricingDto implements ApiSubscriptionPricing {
  requestIncreaseId?: string;
  monthlyId?: string;
  annuallyId?: string;
}

export default ApiSubscriptionPricingDto;

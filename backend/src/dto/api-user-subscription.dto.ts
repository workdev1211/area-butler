import {
  ApiSubscriptionPlanType,
  ApiUserSubscription,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionPlanDto from './api-subscription-plan.dto';

class ApiUserSubscriptionDto implements ApiUserSubscription {
  config: ApiSubscriptionPlanDto;
  createdAt: Date;
  endsAt: Date;
  trialEndsAt: Date;
  type: ApiSubscriptionPlanType;
}

export default ApiUserSubscriptionDto;

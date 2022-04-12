import { ApiSubscriptionPricing } from '@area-butler-types/subscription-plan';
import { IsOptional } from 'class-validator';

class ApiSubscriptionPricingDto implements ApiSubscriptionPricing {

  @IsOptional()
  requestIncreaseId?: string;

  @IsOptional()
  monthlyId?: string;
  
  @IsOptional()
  annuallyId?: string;
}

export default ApiSubscriptionPricingDto;

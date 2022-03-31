import {
  ApiDataSource,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionPricingDto from './api-subscription-pricing.dto';

class ApiSubscriptionPlanDto implements ApiSubscriptionPlan {
  appFeatures: {
    requestIncreasePackage: number;
    sendCustomerQuestionnaireRequest: boolean;
    dataSources: ApiDataSource[];
    canCustomizeExport: boolean;
    fullyCustomizableExpose: boolean;
    htmlSnippet: boolean;
  };
  limits: { numberOfRequestsPerMonth?: number };
  priceIds: { dev: ApiSubscriptionPricingDto; prod: ApiSubscriptionPricingDto };
  properties: string[];
  type: ApiSubscriptionPlanType;
}

export default ApiSubscriptionPlanDto;

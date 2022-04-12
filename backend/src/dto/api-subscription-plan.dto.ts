import {
  ApiDataSource,
  ApiSubscriptionPlan,
  ApiSubscriptionPlanType
} from '@area-butler-types/subscription-plan';
import { IsArray, IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import ApiSubscriptionPricingDto from './api-subscription-pricing.dto';

class ApiSubscriptionPlanDto implements ApiSubscriptionPlan {


  @IsNotEmpty()
  @IsObject()
  appFeatures: {
    requestIncreasePackage: number;
    sendCustomerQuestionnaireRequest: boolean;
    dataSources: ApiDataSource[];
    canCustomizeExport: boolean;
    fullyCustomizableExpose: boolean;
    htmlSnippet: boolean;
  };

  @IsNotEmpty()
  @IsObject()
  limits: { numberOfRequestsPerMonth?: number };

  @IsNotEmpty()
  @IsObject()  
  priceIds: { dev: ApiSubscriptionPricingDto; prod: ApiSubscriptionPricingDto };

  @IsArray()
  @IsNotEmpty()
  properties: string[];

  @IsNotEmpty()
  @IsEnum(ApiSubscriptionPlanType)
  type: ApiSubscriptionPlanType;
}

export default ApiSubscriptionPlanDto;

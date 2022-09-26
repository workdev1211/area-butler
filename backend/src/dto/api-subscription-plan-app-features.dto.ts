import { IsArray, IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';

import {
  ApiDataSource,
  IApiSubscriptionPlanAppFeatures,
} from '@area-butler-types/subscription-plan';

class ApiSubscriptionPlanAppFeaturesDto
  implements IApiSubscriptionPlanAppFeatures
{
  @IsNotEmpty()
  @IsBoolean()
  sendCustomerQuestionnaireRequest: boolean;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(ApiDataSource, { each: true })
  dataSources: ApiDataSource[];

  @IsNotEmpty()
  @IsBoolean()
  canCustomizeExport: boolean;

  @IsNotEmpty()
  @IsBoolean()
  fullyCustomizableExpose: boolean;

  @IsNotEmpty()
  @IsBoolean()
  htmlSnippet: boolean;

  @IsNotEmpty()
  @IsBoolean()
  openAi: boolean;
}

export default ApiSubscriptionPlanAppFeaturesDto;

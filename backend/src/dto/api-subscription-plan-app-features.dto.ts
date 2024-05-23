import { IsArray, IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';

import {
  ApiDataSource,
  IApiSubscriptionPlanAppFeatures,
} from '@area-butler-types/subscription-plan';
import { CsvFileFormatEnum } from '@area-butler-types/types';

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

  @IsNotEmpty()
  @IsEnum(CsvFileFormatEnum)
  csvFileFormat: CsvFileFormatEnum;
}

export default ApiSubscriptionPlanAppFeaturesDto;

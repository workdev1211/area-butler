import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSubscriptionLimitsEnum,
  IApiSubscriptionEnvIds,
  IApiSubscriptionLimitAmount,
  IApiSubscriptionLimitIncreaseParams,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionEnvIdsDto from './api-subscription-env-ids.dto';
import ApiSubscriptionLimitAmountDto from './api-subscription-limit-amount.dto';

class ApiSubscriptionLimitIncreaseParamsDto
  implements IApiSubscriptionLimitIncreaseParams
{
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionEnvIdsDto)
  id: IApiSubscriptionEnvIds;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitAmountDto)
  amount: IApiSubscriptionLimitAmount;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(ApiSubscriptionLimitsEnum)
  type?: ApiSubscriptionLimitsEnum;

  @IsNotEmpty()
  @IsString()
  price: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export default ApiSubscriptionLimitIncreaseParamsDto;

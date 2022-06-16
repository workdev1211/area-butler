import {
  IsNotEmpty,
  IsObject,
  IsArray,
  IsOptional,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiSubscriptionLimit,
  IApiSubscriptionLimitAmount,
  IApiSubscriptionLimitIncreaseParams,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionLimitIncreaseParamsDto from './api-subscription-limit-increase-params.dto';
import ApiSubscriptionLimitAmountDto from './api-subscription-limit-amount.dto';

class ApiSubscriptionLimitDto implements IApiSubscriptionLimit {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitAmountDto)
  amount: IApiSubscriptionLimitAmount;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiSubscriptionLimitIncreaseParamsDto)
  increaseParams?: IApiSubscriptionLimitIncreaseParams[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export default ApiSubscriptionLimitDto;

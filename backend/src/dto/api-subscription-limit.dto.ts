import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiSubscriptionLimit,
  IApiSubscriptionLimitIncreaseParams,
} from '@area-butler-types/subscription-plan';

import ApiSubscriptionLimitIncreaseParamsDto from './api-subscription-limit-increase-params.dto';

class ApiSubscriptionLimitDto implements IApiSubscriptionLimit {
  @IsNotEmpty()
  amount: any;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionLimitIncreaseParamsDto)
  increaseParams?: IApiSubscriptionLimitIncreaseParams;
}

export default ApiSubscriptionLimitDto;

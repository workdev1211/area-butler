import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
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

  @IsNotEmpty()
  @IsString()
  description: string;
}

export default ApiSubscriptionLimitIncreaseParamsDto;

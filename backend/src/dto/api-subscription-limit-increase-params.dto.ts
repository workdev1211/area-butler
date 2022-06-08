import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiSubscriptionEnvIds,
  IApiSubscriptionLimitIncreaseParams,
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionEnvIdsDto from './api-subscription-env-ids.dto';

class ApiSubscriptionLimitIncreaseParamsDto
  implements IApiSubscriptionLimitIncreaseParams
{
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSubscriptionEnvIdsDto)
  id: IApiSubscriptionEnvIds;

  @IsNotEmpty()
  amount: any;
}

export default ApiSubscriptionLimitIncreaseParamsDto;

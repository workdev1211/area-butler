import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { IApiSubscriptionLimitAmount } from '@area-butler-types/subscription-plan';

class ApiSubscriptionLimitAmountDto implements IApiSubscriptionLimitAmount {
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export default ApiSubscriptionLimitAmountDto;

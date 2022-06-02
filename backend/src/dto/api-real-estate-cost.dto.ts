import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';

import {
  ApiRealEstateCost,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import ApiMoneyAmountDto from './api-money-amount.dto';

class ApiRealEstateCostDto implements ApiRealEstateCost {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiMoneyAmountDto)
  price: ApiMoneyAmountDto;

  @IsOptional()
  @IsBoolean()
  startingAt?: boolean;

  @IsNotEmpty()
  @IsEnum(ApiRealEstateCostType)
  type: ApiRealEstateCostType;
}

export default ApiRealEstateCostDto;

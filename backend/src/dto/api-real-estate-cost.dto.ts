import {
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiRealEstateCost,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import ApiMoneyAmountDto from './api-money-amount.dto';

class ApiRealEstateCostDto implements ApiRealEstateCost {
  // should be present either minPrice or maxPrice, or both
  @ValidateIf((realEstate) => realEstate.minPrice || !realEstate.maxPrice)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiMoneyAmountDto)
  minPrice?: ApiMoneyAmountDto;

  @ValidateIf((realEstate) => realEstate.maxPrice || !realEstate.minPrice)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiMoneyAmountDto)
  maxPrice?: ApiMoneyAmountDto;

  @IsNotEmpty()
  @IsEnum(ApiRealEstateCostType)
  type: ApiRealEstateCostType;
}

export default ApiRealEstateCostDto;

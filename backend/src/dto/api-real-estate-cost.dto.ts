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
  @ValidateIf((realEstate) => realEstate.minPrice || !realEstate.price)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiMoneyAmountDto)
  minPrice?: ApiMoneyAmountDto;

  @ValidateIf((realEstate) => realEstate.price || !realEstate.minPrice)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiMoneyAmountDto)
  price?: ApiMoneyAmountDto;

  @IsNotEmpty()
  @IsEnum(ApiRealEstateCostType)
  type: ApiRealEstateCostType;
}

export default ApiRealEstateCostDto;

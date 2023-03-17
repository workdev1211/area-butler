import {
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  ApiRealEstateCost,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import ApiMoneyAmountDto from './api-money-amount.dto';

@Exclude()
class ApiRealEstateCostDto implements ApiRealEstateCost {
  // should be present either minPrice or maxPrice, or both
  @Expose()
  @ValidateIf((realEstate) => realEstate.minPrice || !realEstate.price)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiMoneyAmountDto)
  minPrice?: ApiMoneyAmountDto;

  @Expose()
  @ValidateIf((realEstate) => realEstate.price || !realEstate.minPrice)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiMoneyAmountDto)
  price?: ApiMoneyAmountDto;

  @Expose()
  @IsNotEmpty()
  @IsEnum(ApiRealEstateCostType)
  type: ApiRealEstateCostType;
}

export default ApiRealEstateCostDto;

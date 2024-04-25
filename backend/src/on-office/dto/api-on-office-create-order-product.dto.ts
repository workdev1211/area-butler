import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  IApiOnOfficeCreateOrderProduct,
  OnOfficeProductTypesEnum,
} from '@area-butler-types/on-office';

@Exclude()
class ApiOnOfficeCreateOrderProductDto
  implements IApiOnOfficeCreateOrderProduct
{
  @Expose()
  @IsOptional()
  @IsString()
  transactionDbId?: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(OnOfficeProductTypesEnum)
  type: OnOfficeProductTypesEnum;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export default ApiOnOfficeCreateOrderProductDto;

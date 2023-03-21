import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  IApiOnOfficeCreateOrderProduct,
  OnOfficeProductTypesEnum,
} from '@area-butler-types/on-office';

class ApiOnOfficeCreateOrderProductDto
  implements IApiOnOfficeCreateOrderProduct
{
  @IsOptional()
  @IsString()
  transactionDbId?: string;

  @IsNotEmpty()
  @IsEnum(OnOfficeProductTypesEnum)
  type: OnOfficeProductTypesEnum;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export default ApiOnOfficeCreateOrderProductDto;

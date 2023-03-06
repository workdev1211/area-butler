import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import {
  IApiOnOfficeCreateOrderProduct,
  OnOfficeProductTypesEnum,
} from '@area-butler-types/on-office';

class ApiOnOfficeCreateOrderProductDto
  implements IApiOnOfficeCreateOrderProduct
{
  @IsNotEmpty()
  @IsEnum(OnOfficeProductTypesEnum)
  type: OnOfficeProductTypesEnum;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export default ApiOnOfficeCreateOrderProductDto;

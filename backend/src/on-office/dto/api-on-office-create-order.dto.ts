import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrder,
} from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderProductDto from './api-on-office-create-order-product.dto';

class ApiOnOfficeCreateOrderDto implements IApiOnOfficeCreateOrder {
  @IsNotEmpty()
  @IsString()
  integrationUserId: string;

  @IsNotEmpty()
  @IsString()
  parameterCacheId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiOnOfficeCreateOrderProductDto)
  products: IApiOnOfficeCreateOrderProduct[];
}

export default ApiOnOfficeCreateOrderDto;

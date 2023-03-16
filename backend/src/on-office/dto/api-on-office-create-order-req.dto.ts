import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
} from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderProductDto from './api-on-office-create-order-product.dto';

class ApiOnOfficeCreateOrderReqDto implements IApiOnOfficeCreateOrderReq {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiOnOfficeCreateOrderProductDto)
  products: IApiOnOfficeCreateOrderProduct[];

  @IsNotEmpty()
  @IsString()
  extendedClaim: string;
}

export default ApiOnOfficeCreateOrderReqDto;

import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  IApiOnOfficeCreateOrderProduct,
  IApiOnOfficeCreateOrderReq,
} from '@area-butler-types/on-office';
import ApiOnOfficeCreateOrderProductDto from './api-on-office-create-order-product.dto';

@Exclude()
class ApiOnOfficeCreateOrderReqDto implements IApiOnOfficeCreateOrderReq {
  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @Type(() => ApiOnOfficeCreateOrderProductDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  products: IApiOnOfficeCreateOrderProduct[];
}

export default ApiOnOfficeCreateOrderReqDto;

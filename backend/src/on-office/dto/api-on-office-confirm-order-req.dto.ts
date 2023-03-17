import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiOnOfficeConfirmOrderQueryParams,
  IApiOnOfficeConfirmOrderReq,
  IApiOnOfficeCreateOrderProduct,
} from '@area-butler-types/on-office';
import ApiOnOfficeConfirmOrderQueryParamsDto from './api-on-office-confirm-order-query-params.dto';
import ApiOnOfficeCreateOrderProductDto from './api-on-office-create-order-product.dto';

class ApiOnOfficeConfirmOrderReqDto implements IApiOnOfficeConfirmOrderReq {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOnOfficeCreateOrderProductDto)
  product: IApiOnOfficeCreateOrderProduct;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOnOfficeConfirmOrderQueryParamsDto)
  onOfficeQueryParams: IApiOnOfficeConfirmOrderQueryParams;
}

export default ApiOnOfficeConfirmOrderReqDto;

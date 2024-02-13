import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiPropstackConnectReq } from '../../shared/propstack.types';

@Exclude()
class ApiPropstackConnectReqDto implements IApiPropstackConnectReq {
  @Expose()
  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @Expose()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  shopId: number;
}

export default ApiPropstackConnectReqDto;

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiPropstackConnectReq } from '../../shared/types/propstack';

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

  @Expose()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  brokerId: number;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  teamId?: number;
}

export default ApiPropstackConnectReqDto;

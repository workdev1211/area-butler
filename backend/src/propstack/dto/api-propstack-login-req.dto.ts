import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiPropstackLoginReq } from '@area-butler-types/propstack';

@Exclude()
class ApiPropstackLoginReqDto implements IApiPropstackLoginReq {
  @Expose()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  realEstateId: number;
}

export default ApiPropstackLoginReqDto;

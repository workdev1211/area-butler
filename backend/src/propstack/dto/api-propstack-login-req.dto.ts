import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import { IApiPropstackLoginReq } from '@area-butler-types/propstack';

@Exclude()
class ApiPropstackLoginReqDto implements IApiPropstackLoginReq {
  @Expose()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  propertyId: number;

  @Expose()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  shopId: number;

  @Expose()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  teamId?: number;
}

export default ApiPropstackLoginReqDto;

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import {
  IApiPropstackLoginReq,
  PropstackTextFieldTypeEnum,
} from '@area-butler-types/propstack';

// TODO 'teamId' and 'brokerId' should be mandatory parameters
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

  @Expose()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  brokerId?: number;

  @Expose()
  @IsOptional()
  @IsString()
  targetGroup?: string;

  @Expose()
  @IsOptional()
  @IsEnum(PropstackTextFieldTypeEnum)
  textFieldType?: PropstackTextFieldTypeEnum;
}

export default ApiPropstackLoginReqDto;

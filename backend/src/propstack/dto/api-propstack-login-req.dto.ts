import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

import {
  IApiPropstackLoginReq,
  PropstackActionTypeEnum,
  PropstackFieldNameEnum,
  PropstackTextFieldTypeEnum,
} from '@area-butler-types/propstack';
import { propstackFieldNameToType } from '../../../../shared/constants/propstack';

@Exclude()
class ApiPropstackLoginReqDto implements IApiPropstackLoginReq {
  @Expose()
  @Transform(({ value }: { value: string }) => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  propertyId: number;

  @Expose()
  @Transform(({ value }: { value: string }) => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  shopId: number;

  @Expose()
  @Transform(
    ({ value }: { value: string }) => (value ? parseInt(value, 10) : undefined),
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  brokerId: number;

  @Expose()
  @Transform(
    ({ value }: { value: string }) => (value ? parseInt(value, 10) : undefined),
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  @IsInt()
  @IsPositive()
  teamId?: number;

  @Expose()
  @IsOptional()
  @IsEnum(PropstackActionTypeEnum)
  target?: PropstackActionTypeEnum;

  @Expose()
  @Transform(
    ({ value }: { value: PropstackFieldNameEnum }) =>
      propstackFieldNameToType[value],
    { toClassOnly: true },
  )
  @IsOptional()
  @IsEnum(PropstackTextFieldTypeEnum)
  fieldName?: PropstackTextFieldTypeEnum;
}

export default ApiPropstackLoginReqDto;

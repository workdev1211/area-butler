import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsBoolean,
  Equals,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IIntUserExpMatchTextParams } from '@area-butler-types/integration-user';

@Exclude()
class ExpMatchParamsDto implements IIntUserExpMatchTextParams {
  @Expose()
  @IsNotEmpty()
  @IsString()
  fieldId: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxTextLength?: number;

  @Expose()
  @IsOptional()
  @IsBoolean()
  @Equals(false)
  isSpecialLink?: false;
}

export default ExpMatchParamsDto;

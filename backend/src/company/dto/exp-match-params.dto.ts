import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IIntUserExpMatchParams } from '@area-butler-types/integration-user';

@Exclude()
class ExpMatchParams implements IIntUserExpMatchParams {
  @Expose()
  @IsNotEmpty()
  @IsString()
  fieldId: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxTextLength?: number;
}

export default ExpMatchParams;

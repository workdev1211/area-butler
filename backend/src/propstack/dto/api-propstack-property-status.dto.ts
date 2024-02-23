import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IPropstackPropertyStatus } from '../../shared/types/propstack';

@Exclude()
class ApiPropstackPropertyStatusDto implements IPropstackPropertyStatus {
  @Expose()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  color?: string;
}

export default ApiPropstackPropertyStatusDto;

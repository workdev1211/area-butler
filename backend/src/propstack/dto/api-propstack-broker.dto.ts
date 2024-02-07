import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IPropstackBroker, IPropstackShop } from '../../shared/propstack.types';

@Exclude()
class ApiPropstackBrokerDto implements IPropstackBroker {
  @Expose()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;

  @Expose()
  @IsOptional()
  @IsEmail()
  email?: string;

  @Expose()
  @IsOptional()
  @IsEmail()
  public_email?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  department_ids?: number[];

  shop: IPropstackShop;
}

export default ApiPropstackBrokerDto;

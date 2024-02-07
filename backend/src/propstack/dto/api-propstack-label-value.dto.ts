import {
  isBoolean,
  IsNotEmpty,
  isNumber,
  IsOptional,
  isPositive,
  IsString,
  isString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IPropstackLabelValue } from '../../shared/propstack.types';
import { IsOneOfTypes } from '../../shared/validation/is-one-of-types.decorator';

@Exclude()
class ApiPropstackLabelValueDto<T extends string | number | boolean = string>
  implements IPropstackLabelValue<T>
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  label: string;

  @Expose()
  @IsOptional()
  @IsOneOfTypes(
    [isString, [isPositive, isNumber], isBoolean],
    ['string', 'positive number', 'boolean'],
  )
  value?: T;
}

export default ApiPropstackLabelValueDto;

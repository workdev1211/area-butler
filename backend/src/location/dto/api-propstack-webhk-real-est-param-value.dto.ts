import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IPropstackWebhkRealEstParamValue } from '../../shared/propstack.types';

class ApiPropstackWebhkRealEstParamValueDto
  implements IPropstackWebhkRealEstParamValue
{
  @IsNotEmpty()
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  pretty_value?: string;
}

export default ApiPropstackWebhkRealEstParamValueDto;

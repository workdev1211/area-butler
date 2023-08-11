import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  IPropstackWebhkRealEstCustFields,
  IPropstackWebhkRealEstParamValue,
} from '../../shared/propstack.types';
import ApiPropstackWebhkRealEstParamValueDto from './api-propstack-webhk-real-est-param-value.dto';

class ApiPropstackWebhkRealEstCustFieldsDto
  implements IPropstackWebhkRealEstCustFields
{
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiPropstackWebhkRealEstParamValueDto)
  objekt_webseiten_url: IPropstackWebhkRealEstParamValue;
}

export default ApiPropstackWebhkRealEstCustFieldsDto;

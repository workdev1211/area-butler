import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IPropstackRealEstateStatus,
  IPropstackWebhkRealEstCustFields,
  IPropstackWebhookRealEstate,
} from '../../shared/propstack.types';
import ApiPropstackRealEstStatusDto from './api-propstack-real-est-status.dto';
import ApiPropstackWebhkRealEstCustFieldsDto from './api-propstack-webhk-real-est-cust-fields.dto';

class ApiPropstackWebhookRealEstateDto implements IPropstackWebhookRealEstate {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  short_address: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  lng: number;

  @ValidateIf(
    ({ property_status }: IPropstackWebhookRealEstate): boolean =>
      !!property_status?.id,
  )
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiPropstackRealEstStatusDto)
  property_status: IPropstackRealEstateStatus;

  @ValidateIf(
    ({ custom_fields }: IPropstackWebhookRealEstate): boolean =>
      !!custom_fields?.objekt_webseiten_url?.value,
  )
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiPropstackWebhkRealEstCustFieldsDto)
  custom_fields: IPropstackWebhkRealEstCustFields;
}

export default ApiPropstackWebhookRealEstateDto;

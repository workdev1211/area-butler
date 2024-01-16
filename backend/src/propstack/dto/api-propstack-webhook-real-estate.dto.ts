import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  IPropstackRealEstateStatus,
  IPropstackWebhkRealEstCustFields,
  IPropstackWebhookRealEstate,
} from '../../shared/propstack.types';
import ApiPropstackRealEstStatusDto from '../../location/dto/api-propstack-real-est-status.dto';
import ApiPropstackWebhkRealEstCustFieldsDto from '../../location/dto/api-propstack-webhk-real-est-cust-fields.dto';

@Exclude()
class ApiPropstackWebhookRealEstateDto implements IPropstackWebhookRealEstate {
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
  @IsNotEmpty()
  @IsString()
  address: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  short_address: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  lat: number;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  lng: number;

  @Expose()
  @ValidateIf(
    ({ property_status }: IPropstackWebhookRealEstate): boolean =>
      !!property_status?.id,
  )
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiPropstackRealEstStatusDto)
  property_status: IPropstackRealEstateStatus;

  @Expose()
  @ValidateIf(
    ({ custom_fields }: IPropstackWebhookRealEstate): boolean =>
      !!custom_fields?.objekt_webseiten_url?.value,
  )
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiPropstackWebhkRealEstCustFieldsDto)
  custom_fields: IPropstackWebhkRealEstCustFields;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  department_id?: number;
}

export default ApiPropstackWebhookRealEstateDto;

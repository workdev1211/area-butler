import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

import {
  IPropstackBroker,
  IPropstackLabelValue,
  IPropstackPropertyStatus,
  IPropstackWebhookProperty,
} from '../../shared/types/propstack';
import { PropstackPropMarketTypesEnum } from '@area-butler-types/propstack';
import ApiPropstackPropertyStatusDto from './api-propstack-property-status.dto';
import ApiPropstackLabelValueDto from './api-propstack-label-value.dto';
import ApiPropstackBrokerDto from './api-propstack-broker.dto';

@Exclude()
class ApiPropstackWebhookPropertyDto implements IPropstackWebhookProperty {
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
  @IsNotEmpty()
  @IsEnum(PropstackPropMarketTypesEnum)
  marketing_type: PropstackPropMarketTypesEnum;

  @Expose()
  @Type(() => ApiPropstackPropertyStatusDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  property_status?: IPropstackPropertyStatus;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  broker_id?: number;

  @Expose()
  @Type(() => ApiPropstackBrokerDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  broker?: IPropstackBroker;

  @Expose()
  @IsOptional()
  @IsString()
  changed_attributes?: string;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  title?: IPropstackLabelValue;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  price?: IPropstackLabelValue<number>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  base_rent?: IPropstackLabelValue<number>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  total_rent?: IPropstackLabelValue<number>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  living_space?: IPropstackLabelValue<number>;

  @Expose()
  @IsOptional()
  @IsNumber()
  property_space_value?: number;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  number_of_rooms?: IPropstackLabelValue<number>;

  @Expose()
  @IsOptional()
  @IsString()
  street?: string;

  @Expose()
  @IsOptional()
  @IsString()
  house_number?: string;

  @Expose()
  @IsOptional()
  @IsString()
  zip_code?: string;

  @Expose()
  @IsOptional()
  @IsString()
  city?: string;

  @Expose()
  @IsOptional()
  @IsString()
  region?: string;

  @Expose()
  @IsOptional()
  @IsString()
  country?: string;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  description_note?: IPropstackLabelValue;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  location_note?: IPropstackLabelValue;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  other_note?: IPropstackLabelValue;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  balcony?: IPropstackLabelValue<boolean>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  cellar?: IPropstackLabelValue<boolean>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  garden?: IPropstackLabelValue<boolean>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  kitchen_complete?: IPropstackLabelValue<boolean>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  guest_toilet?: IPropstackLabelValue<boolean>;

  @Expose()
  @Type(() => ApiPropstackLabelValueDto)
  @Transform(
    ({ value }: { value: ApiPropstackLabelValueDto }): IPropstackLabelValue =>
      value?.value ? value : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  ramp?: IPropstackLabelValue<boolean>;
}

export default ApiPropstackWebhookPropertyDto;

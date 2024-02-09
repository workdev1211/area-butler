import {
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsString,
  NotEquals,
  IsObject,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { IApiRealEstateListingSchema } from '@area-butler-types/real-estate';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import { GeoJsonPoint } from '../shared/geo-json.types';
import ApiGeoJsonPointDto from './api-geo-json-point.dto';
import { realEstateAllStatus } from '../../../shared/constants/real-estate';

@Exclude()
class ApiUpsertRealEstateListingDto implements IApiRealEstateListingSchema {
  @Expose()
  @IsNotEmpty()
  @IsString()
  address: string;

  @Expose()
  @Type(() => ApiGeoJsonPointDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  location: GeoJsonPoint;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  showInSnippet?: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @Expose()
  @Type(() => ApiRealEstateCharacteristicsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  characteristics?: ApiRealEstateCharacteristicsDto;

  @Expose()
  @Type(() => ApiRealEstateCostDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  costStructure?: ApiRealEstateCostDto;

  @Expose()
  @IsOptional()
  @IsString()
  @NotEquals(realEstateAllStatus)
  status?: string;

  @Expose()
  @IsOptional()
  @IsString()
  status2?: string;
}

export default ApiUpsertRealEstateListingDto;

import {
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsString,
  NotEquals,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import { GeoJsonPoint } from '../shared/geo-json.types';
import ApiGeoJsonPointDto from './api-geo-json-point.dto';

class ApiUpsertRealEstateListingDto implements ApiUpsertRealEstateListing {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  characteristics?: ApiRealEstateCharacteristicsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiGeoJsonPointDto)
  location: GeoJsonPoint;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  costStructure?: ApiRealEstateCostDto;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  showInSnippet: boolean;

  @IsNotEmpty()
  @IsEnum(ApiRealEstateStatusEnum)
  @NotEquals(ApiRealEstateStatusEnum.ALL)
  status: ApiRealEstateStatusEnum;
}

export default ApiUpsertRealEstateListingDto;

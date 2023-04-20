import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiRealEstateListing,
  ApiRealEstateStatusEnum,
} from '@area-butler-types/real-estate';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';

class ApiRealEstateListingDto implements ApiRealEstateListing {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  // could be an empty string when showAddress is false
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsNotEmpty()
  @IsBoolean()
  showInSnippet: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  costStructure?: ApiRealEstateCostDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  characteristics?: ApiRealEstateCharacteristicsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinatesDto;

  @IsNotEmpty()
  @IsEnum(ApiRealEstateStatusEnum)
  @NotEquals(ApiRealEstateStatusEnum.ALLE)
  status: ApiRealEstateStatusEnum;

  @IsNotEmpty()
  @IsBoolean()
  belongsToParent: boolean;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsNumber()
  openAiRequestQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isOnePageExportActive?: boolean;
}

export default ApiRealEstateListingDto;

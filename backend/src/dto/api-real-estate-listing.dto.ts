import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import { realEstateAllStatus } from '../../../shared/constants/real-estate';

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

  @IsOptional()
  @IsString()
  @NotEquals(realEstateAllStatus)
  status?: string;

  @IsOptional()
  @IsString()
  status2?: string;

  @IsNotEmpty()
  @IsBoolean()
  isFromParent: boolean;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsNumber()
  openAiRequestQuantity?: number;

  @IsOptional()
  @IsDateString()
  iframeEndsAt?: string;

  @IsOptional()
  @IsBoolean()
  isOnePageExportActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isStatsFullExportActive?: boolean;
}

export default ApiRealEstateListingDto;

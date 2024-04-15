import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiRealEstateExtSourcesEnum,
  ApiRealEstateListing,
} from '@area-butler-types/real-estate';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import { realEstateAllStatus } from '../../../shared/constants/real-estate';
import { TLocationIndexData } from '@area-butler-types/location-index';

class ApiRealEstateListingDto implements ApiRealEstateListing {
  @IsNotEmpty()
  @IsString()
  id: string;

  @Type(() => ApiCoordinatesDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  coordinates: ApiCoordinatesDto;

  @IsNotEmpty()
  @IsBoolean()
  isFromParent: boolean;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  showInSnippet: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @Type(() => ApiRealEstateCharacteristicsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  characteristics?: ApiRealEstateCharacteristicsDto;

  @Type(() => ApiRealEstateCostDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  costStructure?: ApiRealEstateCostDto;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsEnum(ApiRealEstateExtSourcesEnum)
  externalSource?: ApiRealEstateExtSourcesEnum;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsDateString()
  iframeEndsAt?: string;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsBoolean()
  isOnePageExportActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isStatsFullExportActive?: boolean;

  // TODO add the validation
  @IsOptional()
  @IsObject()
  locationIndices?: TLocationIndexData;

  @IsOptional()
  @IsNumber()
  openAiRequestQuantity?: number;

  @IsOptional()
  @IsString()
  @NotEquals(realEstateAllStatus)
  status?: string;

  @IsOptional()
  @IsString()
  @NotEquals(realEstateAllStatus)
  status2?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export default ApiRealEstateListingDto;

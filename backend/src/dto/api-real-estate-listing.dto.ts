import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
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
  address: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  characteristics?: ApiRealEstateCharacteristicsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates?: ApiCoordinatesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  costStructure?: ApiRealEstateCostDto;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  showInSnippet: boolean;

  @IsNotEmpty()
  @IsEnum(ApiRealEstateStatusEnum)
  status: ApiRealEstateStatusEnum;
}

export default ApiRealEstateListingDto;

import {
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiRealEstateStatusEnum,
  ApiUpsertRealEstateListing,
} from '@area-butler-types/real-estate';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';

class ApiUpsertRealEstateListingDto implements ApiUpsertRealEstateListing {
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
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  showInSnippet: boolean;

  @IsNotEmpty()
  @IsEnum(ApiRealEstateStatusEnum)
  status: ApiRealEstateStatusEnum;
}

export default ApiUpsertRealEstateListingDto;

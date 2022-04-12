import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';

class ApiRealEstateListingDto implements ApiRealEstateListing {

  @IsNotEmpty()
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
  externalUrl?: string;

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  showInSnippet: boolean;
}

export default ApiRealEstateListingDto;

import { ApiUpsertRealEstateListing } from '@area-butler-types/real-estate';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsOptional, IsBoolean } from 'class-validator';

class ApiUpsertRealEstateListingDto implements ApiUpsertRealEstateListing {

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
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  showInSnippet: boolean;
}

export default ApiUpsertRealEstateListingDto;

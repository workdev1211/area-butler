import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiUpsertPotentialCustomer } from '@area-butler-types/potential-customer';
import { OsmName, TransportationParam } from '@area-butler-types/types';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';

class ApiUpsertPotentialCustomerDto implements ApiUpsertPotentialCustomer {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(OsmName, { each: true })
  preferredAmenities?: OsmName[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiPreferredLocationDto)
  preferredLocations?: ApiPreferredLocationDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  realEstateCharacteristics?: ApiRealEstateCharacteristicsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  realEstateCostStructure?: ApiRealEstateCostDto;

  @IsOptional()
  @IsArray()
  routingProfiles?: TransportationParam[];
}

export default ApiUpsertPotentialCustomerDto;

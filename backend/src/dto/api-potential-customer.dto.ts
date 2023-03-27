import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiPotentialCustomer } from '@area-butler-types/potential-customer';
import { OsmName } from '@area-butler-types/types';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import TransportationParamDto from './transportation-param.dto';

class ApiPotentialCustomerDto implements ApiPotentialCustomer {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(OsmName, { each: true })
  preferredAmenities: OsmName[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiPreferredLocationDto)
  preferredLocations: ApiPreferredLocationDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiRealEstateCharacteristicsDto)
  realEstateCharacteristics: ApiRealEstateCharacteristicsDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiRealEstateCostDto)
  realEstateCostStructure: ApiRealEstateCostDto;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransportationParamDto)
  routingProfiles: TransportationParamDto[];

  @IsNotEmpty()
  @IsBoolean()
  belongsToParent: boolean;
}

export default ApiPotentialCustomerDto;

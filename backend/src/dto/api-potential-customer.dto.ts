import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { ApiPotentialCustomer } from '@area-butler-types/potential-customer';
import { OsmName } from '@area-butler-types/types';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import ApiTransportParamDto from './api-transport-param.dto';

@Exclude()
class ApiPotentialCustomerDto implements ApiPotentialCustomer {
  @Expose()
  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  isFromParent: boolean;

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @IsNotEmpty()
  @IsArray()
  @IsEnum(OsmName, { each: true })
  preferredAmenities: OsmName[];

  @Expose()
  @Type(() => ApiPreferredLocationDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  preferredLocations: ApiPreferredLocationDto[];

  @Expose()
  @Type(() => ApiRealEstateCharacteristicsDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  realEstateCharacteristics: ApiRealEstateCharacteristicsDto;

  @Expose()
  @Type(() => ApiRealEstateCostDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  realEstateCostStructure: ApiRealEstateCostDto;

  @Expose()
  @Type(() => ApiTransportParamDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  routingProfiles: ApiTransportParamDto[];
}

export default ApiPotentialCustomerDto;

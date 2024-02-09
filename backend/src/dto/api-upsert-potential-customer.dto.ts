import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { ApiUpsertPotentialCustomer } from '@area-butler-types/potential-customer';
import { OsmName, TransportationParam } from '@area-butler-types/types';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import ApiTransportationParamDto from './api-transportation-param.dto';

@Exclude()
class ApiUpsertPotentialCustomerDto implements ApiUpsertPotentialCustomer {
  @Expose()
  @IsOptional()
  @IsString()
  email?: string;

  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(OsmName, { each: true })
  preferredAmenities?: OsmName[];

  @Expose()
  @Type(() => ApiPreferredLocationDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  preferredLocations?: ApiPreferredLocationDto[];

  @Expose()
  @Type(() => ApiRealEstateCharacteristicsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  realEstateCharacteristics?: ApiRealEstateCharacteristicsDto;

  @Expose()
  @Type(() => ApiRealEstateCostDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  realEstateCostStructure?: ApiRealEstateCostDto;

  @Expose()
  @Type(() => ApiTransportationParamDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  routingProfiles?: TransportationParam[];
}

export default ApiUpsertPotentialCustomerDto;

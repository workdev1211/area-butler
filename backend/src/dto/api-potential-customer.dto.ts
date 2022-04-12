import { ApiPotentialCustomer } from '@area-butler-types/potential-customer';
import { OsmName } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import TransportationParamDto from './transportation-param.dto';
class ApiPotentialCustomerDto implements ApiPotentialCustomer {

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  id: string;
  
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @IsEnum(OsmName, {each: true})
  preferredAmenities: OsmName[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({each: true})
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
  @ValidateNested({each: true})
  @Type(() => TransportationParamDto)
  routingProfiles: TransportationParamDto[];
}

export default ApiPotentialCustomerDto;

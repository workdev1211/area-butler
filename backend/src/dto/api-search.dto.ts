import { ApiSearch, OsmName } from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import TransportationParamDto from './transportation-param.dto';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import { IsNotEmpty, IsArray, IsObject, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ApiSearchDto implements ApiSearch {

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinatesDto;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => TransportationParamDto)
  meansOfTransportation: TransportationParamDto[];

  @IsNotEmpty()
  @IsArray()
  preferredAmenities: OsmName[];

  @IsOptional()
  @IsArray()
  preferredLocations?: ApiPreferredLocationDto[];

  @IsOptional()
  searchTitle?: string;

  @IsOptional()
  @IsBoolean()
  withIsochrone?: boolean;
}

export default ApiSearchDto;

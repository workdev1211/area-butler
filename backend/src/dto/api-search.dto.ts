import {
  IsNotEmpty,
  IsArray,
  IsObject,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsDate,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiCoordinates,
  ApiSearch,
  OsmName,
  TransportationParam,
} from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiTransportationParamDto from './api-transportation-param.dto';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import { ApiPreferredLocation } from '@area-butler-types/potential-customer';

class ApiSearchDto implements ApiSearch {
  @IsOptional()
  @IsString()
  id?: string;

  @Type(() => ApiCoordinatesDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  coordinates: ApiCoordinates;

  @Type(() => ApiTransportationParamDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  meansOfTransportation: TransportationParam[];

  @IsNotEmpty()
  @IsArray()
  @IsEnum(OsmName, { each: true })
  preferredAmenities: OsmName[];

  @Type(() => ApiPreferredLocationDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  preferredLocations?: ApiPreferredLocation[];

  @IsOptional()
  @IsString()
  searchTitle?: string;

  @IsOptional()
  @IsBoolean()
  withIsochrone?: boolean;

  @IsOptional()
  @IsDate()
  endsAt?: Date;

  @IsOptional()
  @IsString()
  integrationId?: string;
}

export default ApiSearchDto;

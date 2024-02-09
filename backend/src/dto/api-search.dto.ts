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

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinates;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiTransportationParamDto)
  meansOfTransportation: TransportationParam[];

  @IsNotEmpty()
  @IsArray()
  @IsEnum(OsmName, { each: true })
  preferredAmenities: OsmName[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiPreferredLocationDto)
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

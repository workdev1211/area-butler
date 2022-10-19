import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IApiPreferredLocationRouteQuery } from '@area-butler-types/routing';
import { ApiCoordinates } from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import ApiPreferredLocationDto from './api-preferred-location.dto';

class ApiPreferredLocationRouteQueryDto
  implements IApiPreferredLocationRouteQuery
{
  @IsOptional()
  @IsString()
  snapshotToken?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  origin: ApiCoordinates;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiPreferredLocationDto)
  preferredLocations: ApiPreferredLocation[];
}

export default ApiPreferredLocationRouteQueryDto;

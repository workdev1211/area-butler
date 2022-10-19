import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiRouteDestination, ApiRouteQuery } from '@area-butler-types/routing';
import {
  ApiCoordinates,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteDestinationDto from './api-route-destination.dto';

class ApiRouteQueryDto implements ApiRouteQuery {
  @IsOptional()
  @IsString()
  snapshotToken?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiRouteDestinationDto)
  destinations: ApiRouteDestination[];

  @IsOptional()
  @IsArray()
  @IsEnum(MeansOfTransportation, { each: true })
  meansOfTransportation: MeansOfTransportation[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  origin: ApiCoordinates;
}

export default ApiRouteQueryDto;

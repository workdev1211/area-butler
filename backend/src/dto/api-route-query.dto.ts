import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { ApiRouteDestination, ApiRouteQuery } from '@area-butler-types/routing';
import {
  ApiCoordinates,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteDestinationDto from './api-route-destination.dto';

@Exclude()
class ApiRouteQueryDto implements ApiRouteQuery {
  @Expose()
  @Type(() => ApiRouteDestinationDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  destinations: ApiRouteDestination[];

  @Expose()
  @Type(() => ApiCoordinatesDto)
  @IsNotEmpty()
  @ValidateNested()
  origin: ApiCoordinates;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isAddressShown?: boolean;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(MeansOfTransportation, { each: true })
  meansOfTransportation?: MeansOfTransportation[];

  @Expose()
  @IsOptional()
  @IsString()
  snapshotToken?: string;

  @Expose()
  @IsOptional()
  @IsString()
  userEmail?: string;
}

export default ApiRouteQueryDto;

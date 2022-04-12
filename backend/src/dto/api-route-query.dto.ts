import { ApiRouteQuery } from '@area-butler-types/routing';
import { MeansOfTransportation } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteDestinationDto from './api-route-destination.dto';

class ApiRouteQueryDto implements ApiRouteQuery {

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ApiRouteDestinationDto) 
  destinations: ApiRouteDestinationDto[];

  @IsNotEmpty()
  @IsArray()
  @IsEnum(MeansOfTransportation, {each: true})
  meansOfTransportation: MeansOfTransportation[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto) 
  origin: ApiCoordinatesDto;
}

export default ApiRouteQueryDto;

import { EntityRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteDto from './api-route.dto';
import { MeansOfTransportation } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested, IsEnum } from 'class-validator';

class EntityRouteDto implements EntityRoute {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinatesDto;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiRouteDto)
  routes: ApiRouteDto[];

  @IsNotEmpty()
  @IsArray()
  @IsEnum(MeansOfTransportation, { each: true })
  show: MeansOfTransportation[];

  @IsNotEmpty()
  title: string;
}

export default EntityRouteDto;

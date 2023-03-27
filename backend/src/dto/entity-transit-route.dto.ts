import { EntityTransitRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiTransitRouteDto from './api-transit-route.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsBoolean } from 'class-validator';

class EntityTransitRouteDto implements EntityTransitRoute {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinatesDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiTransitRouteDto)
  route: ApiTransitRouteDto;

  @IsNotEmpty()
  @IsBoolean()
  show: boolean;

  @IsNotEmpty()
  title: string;
}

export default EntityTransitRouteDto;

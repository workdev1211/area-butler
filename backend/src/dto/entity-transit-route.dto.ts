import {
  IsNotEmpty,
  ValidateNested,
  IsBoolean,
  IsObject,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { EntityTransitRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiTransitRouteDto from './api-transit-route.dto';

class EntityTransitRouteDto implements EntityTransitRoute {
  @Type(() => ApiCoordinatesDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  coordinates: ApiCoordinatesDto;

  @Type(() => ApiTransitRouteDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  route: ApiTransitRouteDto;

  @IsNotEmpty()
  @IsBoolean()
  show: boolean;

  @IsNotEmpty()
  @IsString()
  title: string;
}

export default EntityTransitRouteDto;

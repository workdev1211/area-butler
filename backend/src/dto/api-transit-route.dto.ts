import { IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

import { ApiRouteSection, ApiTransitRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteSectionDto from './api-route-section.dto';
import { ApiCoordinates } from '@area-butler-types/types';

class ApiTransitRouteDto implements ApiTransitRoute {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  destination: ApiCoordinates;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  origin: ApiCoordinates;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ApiRouteSectionDto)
  sections: ApiRouteSection[];
}

export default ApiTransitRouteDto;

import { ApiTransitRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteSectionDto from './api-route-section.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsArray } from 'class-validator';

class ApiTransitRouteDto implements ApiTransitRoute {

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  destination: ApiCoordinatesDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  origin: ApiCoordinatesDto;

  @IsNotEmpty()
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => ApiRouteSectionDto)
  sections: ApiRouteSectionDto[];
}

export default ApiTransitRouteDto;

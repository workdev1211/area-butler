import { ApiRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import { MeansOfTransportation } from '@area-butler-types/types';
import ApiRouteSectionDto from './api-route-section.dto';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';

class ApiRouteDto implements ApiRoute {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  destination: ApiCoordinatesDto;

  @IsNotEmpty()
  @IsEnum(MeansOfTransportation)
  meansOfTransportation: MeansOfTransportation;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  origin: ApiCoordinatesDto;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ApiRouteSectionDto)
  sections: ApiRouteSectionDto[];
}

export default ApiRouteDto;

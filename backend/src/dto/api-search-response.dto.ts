import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSearchResponse,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiIsochroneDto from './api-isochrone.dto';
import ApiOsmLocationDto from './api-osm-location.dto';

class ApiSearchResponseDto implements ApiSearchResponse {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOsmLocationDto)
  centerOfInterest: ApiOsmLocationDto;

  @IsNotEmpty()
  @IsObject()
  routingProfiles: Record<
    MeansOfTransportation,
    { locationsOfInterest: ApiOsmLocationDto[]; isochrone: ApiIsochroneDto }
  >;
}

export default ApiSearchResponseDto;

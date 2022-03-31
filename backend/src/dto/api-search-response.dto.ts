import {
  ApiSearchResponse,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiOsmLocationDto from './api-osm-location.dto';
import ApiIsochroneDto from './api-isochrone.dto';

class ApiSearchResponseDto implements ApiSearchResponse {
  centerOfInterest: ApiOsmLocationDto;
  routingProfiles: Record<
    MeansOfTransportation,
    { locationsOfInterest: ApiOsmLocationDto[]; isochrone: ApiIsochroneDto }
  >;
}

export default ApiSearchResponseDto;

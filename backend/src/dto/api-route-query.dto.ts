import { ApiRouteQuery } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import { MeansOfTransportation } from '@area-butler-types/types';
import ApiRouteDestinationDto from './api-route-destination.dto';

class ApiRouteQueryDto implements ApiRouteQuery {
  destinations: ApiRouteDestinationDto[];
  meansOfTransportation: MeansOfTransportation[];
  origin: ApiCoordinatesDto;
}

export default ApiRouteQueryDto;

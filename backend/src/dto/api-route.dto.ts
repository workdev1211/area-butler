import { ApiRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import { MeansOfTransportation } from '@area-butler-types/types';
import ApiRouteSectionDto from './api-route-section.dto';

class ApiRouteDto implements ApiRoute {
  destination: ApiCoordinatesDto;
  meansOfTransportation: MeansOfTransportation;
  origin: ApiCoordinatesDto;
  sections: ApiRouteSectionDto[];
}

export default ApiRouteDto;

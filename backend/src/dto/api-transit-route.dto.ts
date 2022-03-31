import { ApiTransitRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteSectionDto from './api-route-section.dto';

class ApiTransitRouteDto implements ApiTransitRoute {
  destination: ApiCoordinatesDto;
  origin: ApiCoordinatesDto;
  sections: ApiRouteSectionDto[];
}

export default ApiTransitRouteDto;

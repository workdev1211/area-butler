import { EntityTransitRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiTransitRouteDto from './api-transit-route.dto';

class EntityTransitRouteDto implements EntityTransitRoute {
  coordinates: ApiCoordinatesDto;
  route: ApiTransitRouteDto;
  show: boolean;
  title: string;
}

export default EntityTransitRouteDto;

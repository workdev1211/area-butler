import { EntityRoute } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRouteDto from './api-route.dto';
import { MeansOfTransportation } from '@area-butler-types/types';

class EntityRouteDto implements EntityRoute {
  coordinates: ApiCoordinatesDto;
  routes: ApiRouteDto[];
  show: MeansOfTransportation[];
  title: string;
}

export default EntityRouteDto;

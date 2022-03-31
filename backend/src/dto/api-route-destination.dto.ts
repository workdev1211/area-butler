import { ApiRouteDestination } from '@area-butler-types/routing';
import ApiCoordinatesDto from './api-coordinates.dto';

class ApiRouteDestinationDto implements ApiRouteDestination {
  coordinates: ApiCoordinatesDto;
  title: string;
}

export default ApiRouteDestinationDto;

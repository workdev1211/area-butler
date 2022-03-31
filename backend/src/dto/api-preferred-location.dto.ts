import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import ApiCoordinatesDto from './api-coordinates.dto';

class ApiPreferredLocationDto implements ApiPreferredLocation {
  address: string;
  coordinates?: ApiCoordinatesDto;
  title: string;
}

export default ApiPreferredLocationDto;

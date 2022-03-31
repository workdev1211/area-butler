import { ApiOsmLocation } from '@area-butler-types/types';
import ApiAddressDto from './api-address.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiOsmEntityDto from './api-osm-entity.dto';

class ApiOsmLocationDto implements ApiOsmLocation {
  address: ApiAddressDto;
  coordinates: ApiCoordinatesDto;
  distanceInMeters: number;
  entity: ApiOsmEntityDto;
}

export default ApiOsmLocationDto;

import { ApiSearch, OsmName } from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import TransportationParamDto from './transportation-param.dto';
import ApiPreferredLocationDto from './api-preferred-location.dto';

class ApiSearchDto implements ApiSearch {
  coordinates: ApiCoordinatesDto;
  meansOfTransportation: TransportationParamDto[];
  preferredAmenities: OsmName[];
  preferredLocations?: ApiPreferredLocationDto[];
  searchTitle?: string;
  withIsochrone?: boolean;
}

export default ApiSearchDto;

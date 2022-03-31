import { ApiGeojsonType, ApiGeometry } from '@area-butler-types/types';

class ApiGeometryDto implements ApiGeometry {
  coordinates: any[];
  type: ApiGeojsonType;
}

export default ApiGeometryDto;

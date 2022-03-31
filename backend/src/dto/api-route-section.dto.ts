import { ApiRouteSection } from '@area-butler-types/routing';
import ApiGeometryDto from './api-geometry.dto';

class ApiRouteSectionDto implements ApiRouteSection {
  duration: number;
  geometry: ApiGeometryDto;
  length: number;
  transportMode: string;
  type?: string;
}

export default ApiRouteSectionDto;

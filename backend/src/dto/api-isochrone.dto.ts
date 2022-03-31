import { ApiIsochrone } from '@area-butler-types/types';
import ApiIsochroneFeatureDto from './api-isochrone-feature.dto';

class ApiIsochroneDto implements ApiIsochrone {
  features: ApiIsochroneFeatureDto[];
  type: string;
}

export default ApiIsochroneDto;

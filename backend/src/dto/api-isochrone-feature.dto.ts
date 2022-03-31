import { ApiIsochroneFeature } from '@area-butler-types/types';

class ApiIsochroneFeatureDto implements ApiIsochroneFeature {
  geometry: { coordinates: any[]; type: string };
  properties: Record<string, any>;
  type: string;
}

export default ApiIsochroneFeatureDto;

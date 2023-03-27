import { ApiIsochroneFeature } from '@area-butler-types/types';
import { IsNotEmpty, IsObject } from 'class-validator';

class ApiIsochroneFeatureDto implements ApiIsochroneFeature {
  @IsNotEmpty()
  @IsObject()
  geometry: { coordinates: any[]; type: string };

  @IsNotEmpty()
  @IsObject()
  properties: Record<string, any>;

  @IsNotEmpty()
  type: string;
}

export default ApiIsochroneFeatureDto;

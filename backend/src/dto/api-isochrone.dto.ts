import { ApiIsochrone } from '@area-butler-types/types';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import ApiIsochroneFeatureDto from './api-isochrone-feature.dto';
class ApiIsochroneDto implements ApiIsochrone {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  features: ApiIsochroneFeatureDto[];

  @IsNotEmpty()
  type: string;
}

export default ApiIsochroneDto;

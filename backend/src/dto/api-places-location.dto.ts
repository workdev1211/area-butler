import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiPlacesLocation,
  IApiPlacesLocationValue,
} from '@area-butler-types/types';
import ApiPlacesLocationValueDto from './api-places-location-value.dto';

class ApiPlacesLocationDto implements IApiPlacesLocation {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiPlacesLocationValueDto)
  value: IApiPlacesLocationValue;
}

export default ApiPlacesLocationDto;

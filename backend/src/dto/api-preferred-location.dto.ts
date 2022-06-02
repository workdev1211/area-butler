import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import ApiCoordinatesDto from './api-coordinates.dto';

class ApiPreferredLocationDto implements ApiPreferredLocation {
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates?: ApiCoordinatesDto;

  @IsNotEmpty()
  title: string;
}

export default ApiPreferredLocationDto;

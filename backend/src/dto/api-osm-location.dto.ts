import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiAddress,
  ApiCoordinates,
  ApiOsmEntity,
  ApiOsmLocation,
} from '@area-butler-types/types';
import ApiAddressDto from './api-address.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiOsmEntityDto from './api-osm-entity.dto';

class ApiOsmLocationDto implements ApiOsmLocation {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiAddressDto)
  address: ApiAddress;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinates;

  @IsNotEmpty()
  @IsNumber()
  distanceInMeters: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiOsmEntityDto)
  entity: ApiOsmEntity;
}

export default ApiOsmLocationDto;

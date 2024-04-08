import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  ApiAddress,
  ApiCoordinates,
  ApiOsmEntity,
  ApiOsmLocation,
} from '@area-butler-types/types';
import ApiAddressDto from './api-address.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiOsmEntityDto from './api-osm-entity.dto';

@Exclude()
class ApiOsmLocationDto implements ApiOsmLocation {
  @Expose()
  @Type(() => ApiAddressDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  address: ApiAddress;

  @Expose()
  @Type(() => ApiCoordinatesDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  coordinates: ApiCoordinates;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  distanceInMeters: number;

  @Expose()
  @Type(() => ApiOsmEntityDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  entity: ApiOsmEntity;
}

export default ApiOsmLocationDto;

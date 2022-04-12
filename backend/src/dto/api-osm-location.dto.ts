import { ApiOsmLocation } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import ApiAddressDto from './api-address.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiOsmEntityDto from './api-osm-entity.dto';

class ApiOsmLocationDto implements ApiOsmLocation {

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiAddressDto)  
  address: ApiAddressDto;
  
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinatesDto;

  @IsNotEmpty()
  @IsNumber()
  distanceInMeters: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiOsmEntityDto)
  entity: ApiOsmEntityDto;
}

export default ApiOsmLocationDto;

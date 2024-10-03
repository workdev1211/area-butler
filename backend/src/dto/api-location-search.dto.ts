import {
  IsNotEmpty,
  IsArray,
  IsObject,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsDate,
  IsString,
  IsEnum,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  ApiCoordinates,
  ApiLocationSearch,
  OsmName,
  TransportationParam,
} from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiTransportParamDto from './api-transport-param.dto';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import { ApiPreferredLocation } from '@area-butler-types/potential-customer';

@Exclude()
class ApiLocationSearchDto implements ApiLocationSearch {
  @Expose()
  @Type(() => ApiCoordinatesDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  coordinates: ApiCoordinates;

  @Expose()
  @Type(() => ApiTransportParamDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  meansOfTransportation: TransportationParam[];

  @Expose()
  @IsNotEmpty()
  @IsArray()
  @IsEnum(OsmName, { each: true })
  preferredAmenities: OsmName[];

  @Expose()
  @IsOptional()
  @IsDate()
  endsAt?: Date;

  @Expose()
  @IsOptional()
  @IsString()
  id?: string;

  @Expose()
  @IsOptional()
  @IsString()
  integrationId?: string;

  @Expose()
  @Type(() => ApiPreferredLocationDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  preferredLocations?: ApiPreferredLocation[];

  @Expose()
  @IsOptional()
  @IsString()
  searchTitle?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  withIsochrone?: boolean;
}

export default ApiLocationSearchDto;

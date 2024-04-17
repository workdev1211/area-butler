import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  TransportationParam,
} from '@area-butler-types/types';
import ApiCoordinatesDto from '../../../dto/api-coordinates.dto';
import ApiOsmEntityDto from '../../../dto/api-osm-entity.dto';
import ApiPreferredLocationDto from '../../../dto/api-preferred-location.dto';
import ApiSearchResponseDto from '../../../dto/api-search-response.dto';
import EntityRouteDto from '../../../dto/entity-route.dto';
import ApiTransportationParamDto from '../../../dto/api-transportation-param.dto';
import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import { EntityTransitRoute } from '@area-butler-types/routing';
import EntityTransitRouteDto from '../../../dto/entity-transit-route.dto';

@Exclude()
class ApiSearchResultSnapshotDto implements ApiSearchResultSnapshot {
  @Expose()
  @Type(() => ApiOsmEntityDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  localityParams: ApiOsmEntity[];

  @Expose()
  @Type(() => ApiCoordinatesDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  location: ApiCoordinates;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  placesLocation: any;

  @Expose()
  @Type(() => ApiSearchResponseDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  searchResponse: ApiSearchResponse;

  @Expose()
  @Type(() => ApiTransportationParamDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  transportationParams: TransportationParam[];

  @Expose()
  @Type(() => ApiPreferredLocationDto)
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  preferredLocations?: ApiPreferredLocation[];

  @Expose()
  @Type(() => EntityRouteDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  routes?: EntityRouteDto[];

  @Expose()
  @Type(() => EntityTransitRouteDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  transitRoutes?: EntityTransitRoute[];
}

export default ApiSearchResultSnapshotDto;

import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  TransportationParam,
} from '@area-butler-types/types';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiOsmEntityDto from './api-osm-entity.dto';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateListingDto from './api-real-estate-listing.dto';
import ApiSearchResponseDto from './api-search-response.dto';
import EntityRouteDto from './entity-route.dto';
import TransportationParamDto from './transportation-param.dto';
import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';

class ApiSearchResultSnapshotDto implements ApiSearchResultSnapshot {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiOsmEntityDto)
  localityParams: ApiOsmEntity[];

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  location: ApiCoordinates;

  @IsNotEmpty()
  placesLocation: any;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ApiPreferredLocationDto)
  preferredLocations: ApiPreferredLocation[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiRealEstateListingDto)
  realEstateListing?: ApiRealEstateListing;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiRealEstateListingDto)
  realEstateListings: ApiRealEstateListing[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntityRouteDto)
  routes: EntityRouteDto[];

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSearchResponseDto)
  searchResponse: ApiSearchResponse;

  @IsNotEmpty()
  @IsArray()
  transitRoutes: any[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransportationParamDto)
  transportationParams: TransportationParam[];

  @IsNotEmpty()
  @IsBoolean()
  isTrial: boolean;
}

export default ApiSearchResultSnapshotDto;

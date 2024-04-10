import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
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
import ApiCoordinatesDto from '../../../dto/api-coordinates.dto';
import ApiOsmEntityDto from '../../../dto/api-osm-entity.dto';
import ApiPreferredLocationDto from '../../../dto/api-preferred-location.dto';
import ApiRealEstateListingDto from '../../../dto/api-real-estate-listing.dto';
import ApiSearchResponseDto from '../../../dto/api-search-response.dto';
import EntityRouteDto from '../../../dto/entity-route.dto';
import ApiTransportationParamDto from '../../../dto/api-transportation-param.dto';
import { ApiPreferredLocation } from '@area-butler-types/potential-customer';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { EntityTransitRoute } from '@area-butler-types/routing';
import EntityTransitRouteDto from '../../../dto/entity-transit-route.dto';

class ApiSearchResultSnapshotDto implements ApiSearchResultSnapshot {
  @Type(() => ApiOsmEntityDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  localityParams: ApiOsmEntity[];

  @Type(() => ApiCoordinatesDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  location: ApiCoordinates;

  @IsNotEmpty()
  @IsObject()
  placesLocation: any;

  @Type(() => ApiRealEstateListingDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  realEstateListings: ApiRealEstateListing[];

  @Type(() => ApiSearchResponseDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  searchResponse: ApiSearchResponse;

  @Type(() => ApiTransportationParamDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  transportationParams: TransportationParam[];

  @IsOptional()
  @IsString()
  integrationId?: string;

  @Type(() => ApiPreferredLocationDto)
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  preferredLocations?: ApiPreferredLocation[];

  @Type(() => ApiRealEstateListingDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  realEstateListing?: ApiRealEstateListing;

  @Type(() => EntityRouteDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  routes?: EntityRouteDto[];

  @Type(() => EntityTransitRouteDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  transitRoutes?: EntityTransitRoute[];
}

export default ApiSearchResultSnapshotDto;

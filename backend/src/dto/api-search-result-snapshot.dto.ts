import { ApiSearchResultSnapshot } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiOsmEntityDto from './api-osm-entity.dto';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateListingDto from './api-real-estate-listing.dto';
import ApiSearchResponseDto from './api-search-response.dto';
import EntityRouteDto from './entity-route.dto';
import TransportationParamDto from './transportation-param.dto';

class ApiSearchResultSnapshotDto implements ApiSearchResultSnapshot {

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => ApiOsmEntityDto)
  localityParams: ApiOsmEntityDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiCoordinatesDto)
  location: ApiCoordinatesDto;

  placesLocation: any;

  @ValidateNested({each: true})
  @IsArray()
  @Type(() => ApiPreferredLocationDto)
  preferredLocations: ApiPreferredLocationDto[];

  @ValidateNested()
  @IsArray()
  @Type(() => ApiRealEstateListingDto)
  realEstateListings: ApiRealEstateListingDto[];

  @ValidateNested()
  @IsArray()
  @Type(() => EntityRouteDto)
  routes: EntityRouteDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchResponseDto)
  searchResponse: ApiSearchResponseDto;

  @IsArray()
  transitRoutes: any[];

  @IsArray()
  @ValidateNested()
  @Type(() => TransportationParamDto)
  transportationParams: TransportationParamDto[];
}

export default ApiSearchResultSnapshotDto;

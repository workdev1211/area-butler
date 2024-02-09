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
  @IsObject()
  placesLocation: any;

  @IsNotEmpty()
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
  @Type(() => ApiTransportationParamDto)
  transportationParams: TransportationParam[];

  @IsOptional()
  @IsString()
  integrationId?: string;
}

export default ApiSearchResultSnapshotDto;

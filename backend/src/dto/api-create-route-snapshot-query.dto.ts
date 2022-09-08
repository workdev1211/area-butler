import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSearch,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  IApiCreateRouteSnapshotQuery,
  IApiPlacesLocation,
} from '@area-butler-types/types';
import ApiSearchDto from './api-search.dto';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiPlacesLocationDto from './api-places-location.dto';
import ApiSearchResponseDto from './api-search-response.dto';

class ApiCreateRouteSnapshotQueryDto implements IApiCreateRouteSnapshotQuery {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchDto)
  searchData: ApiSearch;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchResponseDto)
  searchResponse: ApiSearchResponse;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiPlacesLocationDto)
  placesLocation: IApiPlacesLocation;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  config?: ApiSearchResultSnapshotConfig;
}

export default ApiCreateRouteSnapshotQueryDto;

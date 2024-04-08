import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  ApiOsmLocation,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiUpdateSearchResultSnapshot,
} from '@area-butler-types/types';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';
import ApiOsmLocationDto from '../../../dto/api-osm-location.dto';

@Exclude()
class ApiUpdateSearchResultSnapshotDto
  implements ApiUpdateSearchResultSnapshot
{
  @Expose()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  config?: ApiSearchResultSnapshotConfig;

  @Expose()
  @Type(() => ApiOsmLocationDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  customPois?: ApiOsmLocation[];

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @Type(() => ApiSearchResultSnapshotDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  snapshot?: ApiSearchResultSnapshot;
}

export default ApiUpdateSearchResultSnapshotDto;

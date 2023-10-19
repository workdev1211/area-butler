import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiUpdateSearchResultSnapshot,
} from '@area-butler-types/types';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';

class ApiUpdateSearchResultSnapshotDto
  implements ApiUpdateSearchResultSnapshot
{
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotDto)
  snapshot?: ApiSearchResultSnapshot;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  config?: ApiSearchResultSnapshotConfig;

  @IsOptional()
  @IsString()
  description?: string;
}

export default ApiUpdateSearchResultSnapshotDto;

import { IsNotEmpty, ValidateNested } from 'class-validator';
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
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  config: ApiSearchResultSnapshotConfig;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotDto)
  snapshot: ApiSearchResultSnapshot;
}

export default ApiUpdateSearchResultSnapshotDto;

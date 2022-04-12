import { ApiUpdateSearchResultSnapshot } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';
class ApiUpdateSearchResultSnapshotDto
  implements ApiUpdateSearchResultSnapshot
{

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  config: ApiSearchResultSnapshotConfigDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotDto)
  snapshot: ApiSearchResultSnapshotDto;
}

export default ApiUpdateSearchResultSnapshotDto;

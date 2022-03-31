import { ApiUpdateSearchResultSnapshot } from '@area-butler-types/types';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';

class ApiUpdateSearchResultSnapshotDto
  implements ApiUpdateSearchResultSnapshot
{
  config: ApiSearchResultSnapshotConfigDto;
  snapshot: ApiSearchResultSnapshotDto;
}

export default ApiUpdateSearchResultSnapshotDto;

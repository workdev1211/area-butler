import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';

class ApiSearchResultSnapshotResponseDto
  implements ApiSearchResultSnapshotResponse {
  config?: ApiSearchResultSnapshotConfigDto;
  createdAt: Date;
  description?: string;
  id: string;
  lastAccess?: Date;
  mapboxToken: string;
  snapshot: ApiSearchResultSnapshotDto;
  token: string;
}

export default ApiSearchResultSnapshotResponseDto;

import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';

class ApiSearchResultSnapshotResponseDto
  implements ApiSearchResultSnapshotResponse
{
  @IsOptional()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  config?: ApiSearchResultSnapshotConfigDto;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsDate()
  lastAccess?: Date;

  @IsNotEmpty()
  mapboxToken: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotDto)
  snapshot: ApiSearchResultSnapshotDto;

  @IsNotEmpty()
  token: string;
}

export default ApiSearchResultSnapshotResponseDto;

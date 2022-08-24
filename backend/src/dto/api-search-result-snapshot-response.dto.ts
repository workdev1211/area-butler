import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiSearchResultSnapshotResponse } from '@area-butler-types/types';
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
  @IsDate()
  endsAt?: Date;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsDate()
  lastAccess?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;

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

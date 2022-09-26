import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
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
  @IsObject()
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
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsDate()
  lastAccess?: Date;

  @IsOptional()
  @IsNumber()
  visitAmount?: number;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @IsNotEmpty()
  @IsString()
  mapboxToken: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotDto)
  snapshot: ApiSearchResultSnapshotDto;

  @IsNotEmpty()
  @IsString()
  token: string;
}

export default ApiSearchResultSnapshotResponseDto;

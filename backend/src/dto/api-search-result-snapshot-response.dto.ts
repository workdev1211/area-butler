import {
  IsBoolean,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  IApiUserPoiIcon,
} from '@area-butler-types/types';
import ApiSearchResultSnapshotConfigDto from './api-search-result-snapshot-config.dto';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';
import ApiUserPoiIconDto from './api-user-poi-icon.dto';

class ApiSearchResultSnapshotResponseDto
  implements ApiSearchResultSnapshotResponse
{
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSearchResultSnapshotConfigDto)
  config?: ApiSearchResultSnapshotConfig;

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
  snapshot: ApiSearchResultSnapshot;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsBoolean()
  isTrial?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiUserPoiIconDto)
  userPoiIcons?: IApiUserPoiIcon[];
}

export default ApiSearchResultSnapshotResponseDto;

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  ApiCreateSnapshotReq,
  ApiSearchResultSnapshot,
} from '@area-butler-types/types';
import ApiSearchResultSnapshotDto from './api-search-result-snapshot.dto';

@Exclude()
class ApiCreateSnapshotReqDto implements ApiCreateSnapshotReq {
  @Expose()
  @Type(() => ApiSearchResultSnapshotDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  snapshot: ApiSearchResultSnapshot;

  @Expose()
  @IsOptional()
  @IsString()
  integrationId?: string;
}

export default ApiCreateSnapshotReqDto;

import { IsInt, IsObject, IsOptional, IsPositive } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { Document, FilterQuery, ProjectionFields } from 'mongoose';

import { TApiMongoSortQuery, TFetchReqParams } from '../shared/types/shared';

@Exclude()
class ApiFetchReqParamsDto<T extends Document> implements TFetchReqParams<T> {
  @Expose()
  @IsOptional()
  @IsObject()
  filter?: FilterQuery<T>;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @Expose()
  @IsOptional()
  @IsObject()
  project?: ProjectionFields<T>;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  skip?: number;

  @Expose()
  @IsOptional()
  @IsObject()
  sort?: TApiMongoSortQuery;
}

export default ApiFetchReqParamsDto;

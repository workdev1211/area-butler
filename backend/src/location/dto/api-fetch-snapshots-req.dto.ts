import { IsInt, IsObject, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { FilterQuery, ProjectionFields } from 'mongoose';

import {
  IApiFetchSnapshotsReq,
  TApiMongoSortQuery,
} from '../../shared/shared.types';
import { SearchResultSnapshotDocument } from '../schema/search-result-snapshot.schema';

class ApiFetchSnapshotsReqDto implements IApiFetchSnapshotsReq {
  @IsOptional()
  @Transform(({ value }: { value: string }): number => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsInt()
  @IsPositive()
  skip?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }): number => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsInt()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Transform(
    ({ value }: { value: string }): FilterQuery<SearchResultSnapshotDocument> =>
      JSON.parse(value),
    { toClassOnly: true },
  )
  @IsObject()
  filter?: FilterQuery<SearchResultSnapshotDocument>;

  @IsOptional()
  @Transform(
    ({
      value,
    }: {
      value: string;
    }): ProjectionFields<SearchResultSnapshotDocument> => {
      const parsedProject = JSON.parse(value);

      Object.keys(parsedProject).forEach((key) => {
        parsedProject[key] = parseInt(parsedProject[key], 10) || 0;
      });

      return parsedProject;
    },
    { toClassOnly: true },
  )
  @IsObject()
  project?: ProjectionFields<SearchResultSnapshotDocument>;

  @IsOptional()
  @Transform(
    ({ value }: { value: string }): TApiMongoSortQuery => {
      const parsedSort = JSON.parse(value);

      Object.keys(parsedSort).forEach((key) => {
        parsedSort[key] = parseInt(parsedSort[key], 10) || 0;
      });

      return parsedSort;
    },
    { toClassOnly: true },
  )
  @IsObject()
  sort?: TApiMongoSortQuery;
}

export default ApiFetchSnapshotsReqDto;

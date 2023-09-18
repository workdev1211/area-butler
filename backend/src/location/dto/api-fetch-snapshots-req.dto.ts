import { IsInt, IsObject, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

import { IApiFetchSnapshotsReq } from '@area-butler-types/location';
import {
  IApiMongoFilterParams,
  IApiMongoProjectSortParams,
} from '@area-butler-types/types';

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
    ({ value }: { value: string }): IApiMongoFilterParams => JSON.parse(value),
    { toClassOnly: true },
  )
  @IsObject()
  filter?: IApiMongoFilterParams;

  @IsOptional()
  @Transform(
    ({ value }: { value: string }): IApiMongoProjectSortParams => {
      const parsedProject = JSON.parse(value);

      Object.keys(parsedProject).forEach((key) => {
        parsedProject[key] = parseInt(parsedProject[key], 10) || 0;
      });

      return parsedProject;
    },
    { toClassOnly: true },
  )
  @IsObject()
  project?: IApiMongoProjectSortParams;

  @IsOptional()
  @Transform(
    ({ value }: { value: string }): IApiMongoProjectSortParams => {
      const parsedSort = JSON.parse(value);

      Object.keys(parsedSort).forEach((key) => {
        parsedSort[key] = parseInt(parsedSort[key], 10) || 0;
      });

      return parsedSort;
    },
    { toClassOnly: true },
  )
  @IsObject()
  sort?: IApiMongoProjectSortParams;
}

export default ApiFetchSnapshotsReqDto;

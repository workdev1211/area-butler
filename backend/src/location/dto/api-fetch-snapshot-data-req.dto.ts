import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  IApiFetchSnapshotDataReq,
  SnapshotDataTypesEnum,
} from '@area-butler-types/external-api';
import ApiFetchPoiDataReqDto from './api-fetch-poi-data-req.dto';
import { OsmName } from '@area-butler-types/types';
import { getEnumValidMessage } from '../../shared/validation.functions';
import { defaultPoiTypes } from '../../../../shared/constants/location';

class ApiFetchSnapshotDataReqDto
  extends ApiFetchPoiDataReqDto
  implements IApiFetchSnapshotDataReq
{
  @IsNotEmpty()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(SnapshotDataTypesEnum, {
    message: getEnumValidMessage,
  })
  responseType: SnapshotDataTypesEnum;

  @IsOptional()
  @IsString()
  snapshotId?: string;

  @IsOptional()
  @Transform(
    ({ value }: { value: string[] }): string[] =>
      value.map((poiType) => poiType.toLowerCase()),
    {
      toClassOnly: true,
    },
  )
  @IsArray()
  @IsEnum(OsmName, { each: true, message: getEnumValidMessage })
  poiTypes?: OsmName[] = defaultPoiTypes;
}

export default ApiFetchSnapshotDataReqDto;

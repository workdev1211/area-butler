import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  IApiFetchSnapshotDataReq,
  SnapshotDataTypesEnum,
} from '../../shared/types/external-api';
import ApiFetchPoiDataReqDto from './api-fetch-poi-data-req.dto';
import { OsmName } from '@area-butler-types/types';
import { getEnumValidMessage } from '../../shared/functions/validation';
import { defaultPoiTypes } from '../../../../shared/constants/location';

class ApiFetchSnapshotDataReqDto
  extends ApiFetchPoiDataReqDto
  implements IApiFetchSnapshotDataReq
{
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isAddressShown?: boolean;

  @ValidateIf(
    ({ snapshotId, lat, lng, address }) =>
      !snapshotId && ((lat && lng) || !address),
  )
  @IsNotEmpty()
  @Transform(({ value }) => +value, { toClassOnly: true })
  @IsNumber()
  lat?: number;

  @ValidateIf(
    ({ snapshotId, lat, lng, address }) =>
      !snapshotId && ((lat && lng) || !address),
  )
  @IsNotEmpty()
  @Transform(({ value }) => +value, { toClassOnly: true })
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  markerColor?: string;

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

  @IsOptional()
  @IsString()
  publicationId?: string;

  @IsOptional()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(SnapshotDataTypesEnum, {
    message: getEnumValidMessage,
  })
  responseType?: SnapshotDataTypesEnum = SnapshotDataTypesEnum.DIRECT_LINK;

  @IsOptional()
  @IsString()
  snapshotId?: string;

  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default ApiFetchSnapshotDataReqDto;

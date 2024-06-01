import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { MeansOfTransportation } from '@area-butler-types/types';
import ApiCoordinatesOrAddressDto from './api-coordinates-or-address.dto';
import {
  ApiUnitsOfTransportEnum,
  IApiFetchPoiDataReq,
} from '../../shared/types/external-api';
import { getEnumValidMessage } from '../../shared/functions/validation';

const DEFAULT_POI_NUMBER = 5;
const DEFAULT_DISTANCE = 10;

// @Exclude()
class ApiFetchPoiDataReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiFetchPoiDataReq
{
  @IsOptional()
  @Transform(({ value }: { value: string }): number => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  poiNumber?: number = DEFAULT_POI_NUMBER;

  @IsOptional()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(MeansOfTransportation, {
    message: getEnumValidMessage,
  })
  transportMode?: MeansOfTransportation = MeansOfTransportation.WALK;

  @IsOptional()
  @Transform(({ value }: { value: string }): number => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsNumber()
  @IsPositive()
  distance?: number = DEFAULT_DISTANCE;

  @IsOptional()
  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsEnum(ApiUnitsOfTransportEnum, {
    message: getEnumValidMessage,
  })
  unit?: ApiUnitsOfTransportEnum = ApiUnitsOfTransportEnum.MINUTES;
}

export default ApiFetchPoiDataReqDto;

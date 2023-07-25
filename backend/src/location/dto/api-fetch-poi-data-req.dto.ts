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
} from '@area-butler-types/external-api';
import { getEnumValidMessage } from '../../shared/validation.functions';

const DEFAULT_POI_NUMBER = 5;
const DEFAULT_DISTANCE = 10;

class ApiFetchPoiDataReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiFetchPoiDataReq
{
  @Transform(({ value }: { value: string }): number => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  poiNumber?: number = DEFAULT_POI_NUMBER;

  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsEnum(MeansOfTransportation, {
    message: getEnumValidMessage,
  })
  transportMode?: MeansOfTransportation = MeansOfTransportation.WALK;

  @Transform(({ value }: { value: string }): number => parseInt(value, 10), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  distance?: number = DEFAULT_DISTANCE;

  @Transform(({ value }: { value: string }): string => value.toUpperCase(), {
    toClassOnly: true,
  })
  @IsOptional()
  @IsEnum(ApiUnitsOfTransportEnum, {
    message: getEnumValidMessage,
  })
  unit?: ApiUnitsOfTransportEnum = ApiUnitsOfTransportEnum.MINUTES;
}

export default ApiFetchPoiDataReqDto;

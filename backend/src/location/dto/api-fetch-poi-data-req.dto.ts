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

const DEFAULT_POI_NUMBER = 5;
const DEFAULT_DISTANCE = 10;

class ApiFetchPoiDataReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiFetchPoiDataReq
{
  @Transform(
    ({ value }: { value: string }): number =>
      parseInt(value, 10) || DEFAULT_POI_NUMBER,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  poiNumber?: number = DEFAULT_POI_NUMBER;

  @Transform(
    ({ value }: { value: string }): MeansOfTransportation => {
      const transportMode = value.toUpperCase() as MeansOfTransportation;

      return Object.values(MeansOfTransportation).includes(transportMode)
        ? transportMode
        : MeansOfTransportation.WALK;
    },
    { toClassOnly: true },
  )
  @IsOptional()
  @IsEnum(MeansOfTransportation)
  transportMode?: MeansOfTransportation = MeansOfTransportation.WALK;

  @Transform(
    ({ value }: { value: string }): number =>
      parseInt(value, 10) || DEFAULT_DISTANCE,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsNumber()
  @IsPositive()
  distance?: number = DEFAULT_DISTANCE;

  @Transform(
    ({ value }: { value: string }): ApiUnitsOfTransportEnum => {
      const unit = value.toUpperCase() as ApiUnitsOfTransportEnum;

      return Object.values(ApiUnitsOfTransportEnum).includes(unit)
        ? unit
        : ApiUnitsOfTransportEnum.MINUTES;
    },
    { toClassOnly: true },
  )
  @IsOptional()
  @IsEnum(ApiUnitsOfTransportEnum)
  unit?: ApiUnitsOfTransportEnum = ApiUnitsOfTransportEnum.MINUTES;
}

export default ApiFetchPoiDataReqDto;

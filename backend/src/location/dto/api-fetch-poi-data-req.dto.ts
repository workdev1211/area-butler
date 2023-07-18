import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

import { MeansOfTransportation } from '@area-butler-types/types';
import ApiCoordinatesOrAddressDto from './api-coordinates-or-address.dto';
import {
  ApiUnitsOfTransportEnum,
  IApiFetchPoiDataReq,
} from '@area-butler-types/external-api';

class ApiFetchPoiDataReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiFetchPoiDataReq
{
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
    ({ value }: { value: string }): number => parseInt(value, 10) || 10,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsNumber()
  distance?: number = 10;

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

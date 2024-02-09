import { IsNumber, IsNotEmpty, Max, Min, IsEnum } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation,
} from '@area-butler-types/types';

@Exclude()
class ApiTransportationParamDto implements TransportationParam {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(60)
  amount: number;

  @Expose()
  @IsNotEmpty()
  @IsEnum(MeansOfTransportation)
  type: MeansOfTransportation;

  @Expose()
  @IsNotEmpty()
  @IsEnum(UnitsOfTransportation)
  unit: UnitsOfTransportation;
}

export default ApiTransportationParamDto;

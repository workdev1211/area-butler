import {
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation,
} from '@area-butler-types/types';

import { IsNumber, IsNotEmpty, Max, Min, IsEnum } from 'class-validator';

class TransportationParamDto implements TransportationParam {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(60)
  amount: number;

  @IsNotEmpty()
  @IsEnum(MeansOfTransportation)
  type: MeansOfTransportation;

  @IsNotEmpty()
  @IsEnum(UnitsOfTransportation)
  unit: UnitsOfTransportation;
}

export default TransportationParamDto;

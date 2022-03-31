import {
  MeansOfTransportation,
  TransportationParam,
  UnitsOfTransportation,
} from '@area-butler-types/types';

class TransportationParamDto implements TransportationParam {
  amount: number;
  type: MeansOfTransportation;
  unit: UnitsOfTransportation;
}

export default TransportationParamDto;

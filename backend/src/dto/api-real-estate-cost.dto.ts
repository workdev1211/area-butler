import {
  ApiRealEstateCost,
  ApiRealEstateCostType,
} from '@area-butler-types/real-estate';
import ApiMoneyAmountDto from './api-money-amount.dto';

class ApiRealEstateCostDto implements ApiRealEstateCost {
  price: ApiMoneyAmountDto;
  startingAt?: boolean;
  type: ApiRealEstateCostType;
}

export default ApiRealEstateCostDto;

import { ApiMoneyAmount } from '@area-butler-types/types';

class ApiMoneyAmountDto implements ApiMoneyAmount {
  amount?: number;
  currency: string;
}

export default ApiMoneyAmountDto;

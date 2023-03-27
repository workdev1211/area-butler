import { ApiMoneyAmount } from '@area-butler-types/types';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

class ApiMoneyAmountDto implements ApiMoneyAmount {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsNotEmpty()
  currency: string;
}

export default ApiMoneyAmountDto;

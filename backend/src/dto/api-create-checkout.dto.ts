import { ApiCreateCheckout } from '@area-butler-types/billing';
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';



export class ApiCreateCheckoutDto implements ApiCreateCheckout {

  @IsOptional()
  @IsNumber()
  amount?: number;
  
  @IsOptional()
  @IsIn(['subscription', 'payment'])
  mode?: 'subscription' | 'payment';

  @IsNotEmpty()
  priceId: string;

  @IsOptional()
  @IsNumber()
  trialPeriod?: number;
}

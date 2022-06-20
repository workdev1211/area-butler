import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiCreateCheckout,
  IApiCheckoutMetadata,
} from '@area-butler-types/billing';
import { IsStripeCheckoutMetadata } from '../shared/isStripeCheckoutMetadata.validator';

export class ApiCreateCheckoutDto implements ApiCreateCheckout {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsIn(['subscription', 'payment'])
  mode?: 'subscription' | 'payment';

  @IsNotEmpty()
  @IsString()
  priceId: string;

  @IsOptional()
  @IsObject()
  @IsStripeCheckoutMetadata()
  metadata?: IApiCheckoutMetadata;

  @IsOptional()
  @IsNumber()
  trialPeriod?: number;
}

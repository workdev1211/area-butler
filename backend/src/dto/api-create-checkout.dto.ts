import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiCreateCheckout,
  ApiStripeCheckoutModeEnum,
  IApiCheckoutMetadata,
} from '@area-butler-types/billing';
import { IsStripeCheckoutMetadata } from '../shared/decorators/is-stripe-checkout-metadata.decorator';

export class ApiCreateCheckoutDto implements ApiCreateCheckout {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(ApiStripeCheckoutModeEnum)
  mode?: ApiStripeCheckoutModeEnum;

  @IsNotEmpty()
  @IsString()
  priceId: string;

  @IsOptional()
  @IsObject()
  @IsStripeCheckoutMetadata()
  metadata?: IApiCheckoutMetadata;

  // @IsOptional()
  // @IsNumber()
  // trialPeriod?: number;
}

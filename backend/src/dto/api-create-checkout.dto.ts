import { ApiCreateCheckout } from '@area-butler-types/billing';

export class ApiCreateCheckoutDto implements ApiCreateCheckout {
  amount?: number;
  mode?: 'subscription' | 'payment';
  priceId: string;
  trialPeriod?: number;
}

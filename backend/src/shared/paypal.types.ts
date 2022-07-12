import { LinkDescription } from '@paypal/paypal-js/types/apis/orders';

export interface IPaypalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

export enum PaypalWebhookEventTypeEnum {
  BillingSubscriptionActivated = 'BILLING.SUBSCRIPTION.ACTIVATED',
  BillingSubscriptionCancelled = 'BILLING.SUBSCRIPTION.CANCELLED',
  PaymentSaleCompleted = 'PAYMENT.SALE.COMPLETED',
}

export interface IPaypalWebhookEvent<T> {
  id: string;
  event_version: '1.0';
  create_time: string;
  resource_type: 'subscription';
  resource_version: '2.0';
  event_type:
    | PaypalWebhookEventTypeEnum.BillingSubscriptionActivated
    | PaypalWebhookEventTypeEnum.BillingSubscriptionCancelled;
  summary: string;
  resource: T;
  links: LinkDescription[];
}

export interface IPaypalWebhookVerificationBody<T> {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: IPaypalWebhookEvent<T>;
}

export enum PaypalWebhookVerificationStatusEnum {
  Success = 'SUCCESS',
  Failure = 'FAILURE',
}

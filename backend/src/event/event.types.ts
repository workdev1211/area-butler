import { UserDocument } from '../user/schema/user.schema';
import { ILimitIncreaseMetadata } from '@area-butler-types/billing';
import {
  IApiSubscriptionLimitAmount,
  PaymentSystemTypeEnum,
} from '@area-butler-types/subscription-plan';

export enum EventType {
  USER_CREATED_EVENT = 'USER_CREATED_EVENT',
  USER_CONSENT_EVENT = 'USER_CONSENT_EVENT',
  SUBSCRIPTION_UPSERT_EVENT = 'SUBSCRIPTION_UPSERT_EVENT',
  SUBSCRIPTION_RENEW_EVENT = 'SUBSCRIPTION_RENEW_EVENT',
  REQUEST_CONTINGENT_INCREASE_EVENT = 'REQUEST_CONTINGENT_INCREASE_EVENT',
  ADDRESS_EXPIRATION_INCREASE_EVENT = 'ADDRESS_EXPIRATION_INCREASE_EVENT',
}

export interface UserEvent {
  user: UserDocument;
}

export interface SubscriptionCreateEvent {
  customerId: string;
  subscriptionId?: string;
  priceId: string;
  endsAt: Date;
  paymentSystemType: PaymentSystemTypeEnum;
}

export interface ILimitIncreaseEvent {
  customerId?: string;
  amount: IApiSubscriptionLimitAmount;
  metadata?: ILimitIncreaseMetadata;
  paymentSystemType: PaymentSystemTypeEnum;
}

export interface SubscriptionRenewEvent {
  customerId?: string;
  subscriptionId: string;
  paymentSystemType: PaymentSystemTypeEnum;
}

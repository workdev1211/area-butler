import { UserDocument } from '../user/schema/user.schema';
import { ILimitIncreaseMetadata } from '@area-butler-types/billing';
import {
  IApiSubscriptionLimitAmount,
  PaymentSystemTypeEnum,
} from '@area-butler-types/subscription-plan';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';

export enum EventType {
  INT_USER_CREATED_EVENT = 'INT_USER_CREATED_EVENT',
  USER_CREATED_EVENT = 'USER_CREATED_EVENT',
  // not used for the moment
  // USER_CONSENT_EVENT = 'USER_CONSENT_EVENT',
  SUBSCRIPTION_UPSERT_EVENT = 'SUBSCRIPTION_UPSERT_EVENT',
  SUBSCRIPTION_RENEW_EVENT = 'SUBSCRIPTION_RENEW_EVENT',
  TRIAL_SUBSCRIPTION_UPSERT_EVENT = 'TRIAL_SUBSCRIPTION_UPSERT_EVENT',
  TRIAL_DATA_REMOVE_EVENT = 'TRIAL_DATA_REMOVE_EVENT',
  REQUEST_CONTINGENT_INCREASE_EVENT = 'REQUEST_CONTINGENT_INCREASE_EVENT',
  ADDRESS_EXPIRATION_INCREASE_EVENT = 'ADDRESS_EXPIRATION_INCREASE_EVENT',
}

export enum PotentCustomerEventEnum {
  created = 'potential_customer.created',
  deleted = 'potential_customer.deleted',
  updated = 'potential_customer.updated',
}

export interface IUserCreatedEvent {
  user: UserDocument;
}

export interface IIntUserCreatedEvent {
  user: TIntegrationUserDocument;
}

export interface ITrialDataRemoveEvent {
  userId: string;
}

export interface ITrialSubscriptionUpsertEvent {
  user: UserDocument;
  endsAt: Date;
}

export interface ISubscriptionUpsertEvent {
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

export interface ISubscriptionRenewEvent {
  customerId?: string;
  subscriptionId: string;
  paymentSystemType: PaymentSystemTypeEnum;
}

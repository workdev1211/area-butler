import { UserDocument } from '../user/schema/user.schema';
import { ILimitIncreaseMetadata } from '@area-butler-types/billing';
import { IApiSubscriptionLimitAmount } from '@area-butler-types/subscription-plan';

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
  stripeCustomerId: string;
  stripePriceId: string;
  stripeSubscriptionId: string;
  endsAt: Date;
  trialEndsAt: Date;
}

export interface ILimitIncreaseEvent {
  stripeCustomerId?: string;
  amount: IApiSubscriptionLimitAmount;
  metadata?: ILimitIncreaseMetadata;
}

export interface SubscriptionRenewEvent {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

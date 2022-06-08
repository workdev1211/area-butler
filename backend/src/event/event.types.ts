import { UserDocument } from '../user/schema/user.schema';

export enum EventType {
  USER_CREATED_EVENT = 'USER_CREATED_EVENT',
  USER_CONSENT_EVENT = 'USER_CONSENT_EVENT',
  SUBSCRIPTION_UPSERT_EVENT = 'SUBSCRIPTION_UPSERT_EVENT',
  SUBSCRIPTION_RENEW_EVENT = 'SUBSCRIPTION_RENEW_EVENT',
  REQUEST_CONTINGENT_INCREASE_EVENT = 'REQUEST_CONTINGENT_INCREASE_EVENT',
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
  stripeCustomerId: string;
  amount: any;
}

export interface SubscriptionRenewEvent {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

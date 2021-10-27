import { UserDocument } from "src/user/schema/user.schema";


export enum EventType {
    USER_CREATED_EVENT = 'USER_CREATED_EVENT',
    SUBSCRIPTION_CREATED_EVENT = 'SUBSCRIPTION_CREATED_EVENT',
    SUBSCRIPTION_CANCELED_EVENT = 'SUBSCRIPTION_CANCELED_EVENT',
    REQUEST_CONTINGENT_INCREASED_EVENT = 'REQUEST_CONTINGENT_INCREASED_EVENT',
    CHECKOUT_COMPLETED_EVENT = 'SUBSCRIPTION_CREATED_EVENT'
}

export interface UserCreatedEvent {
    user: UserDocument;
}

export interface SubscriptionCreatedEvent {
    stripeCustomerId: string;
    stripePriceId: string;
}

export interface SubscriptionCanceledEvent {
    stripeCustomerId: string;
}

export interface RequestContingentIncreasedEvent {
    stripeCustomerId: string;
    amount: number;
}
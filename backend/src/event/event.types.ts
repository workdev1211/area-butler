import { UserDocument } from "src/user/schema/user.schema";


export enum EventType {
    USER_CREATED_EVENT = 'USER_CREATED_EVENT',
    USER_CONSENT_EVENT = 'USER_CONSENT_EVENT',
    SUBSCRIPTION_UPSERTED_EVENT = 'SUBSCRIPTION_UPSERTED_EVENT',
    SUBSCRIPTION_RENEWED_EVENT = 'SUBSCRIPTION_RENEWED_EVENT',
    REQUEST_CONTINGENT_INCREASED_EVENT = 'REQUEST_CONTINGENT_INCREASED_EVENT',
}

export interface UserEvent {
    user: UserDocument;
}

export interface SubscriptionCreatedEvent {
    stripeCustomerId: string;
    stripePriceId: string;
    stripeSubscriptionId: string;
    endsAt: Date;
    trialEndsAt: Date;
}

export interface RequestContingentIncreasedEvent {
    stripeCustomerId: string;
    amount: number;
}

export interface SubscriptionRenewedEvent {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
}

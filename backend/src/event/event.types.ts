import { UserDocument } from "src/user/schema/user.schema";


export enum EventType {
    USER_CREATED_EVENT = 'USER_CREATED_EVENT',
    SUBSCRIPTION_CREATED_EVENT = 'SUBSCRIPTION_CREATED_EVENT',
    CHECKOUT_COMPLETED_EVENT = 'SUBSCRIPTION_CREATED_EVENT'
}

export interface UserCreatedEvent {
    user: UserDocument;
}

export interface SubscriptionCreatedEvent {
    stripeCustomerId: string;
    stripePriceId: string;
}
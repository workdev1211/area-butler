import { UserDocument } from "src/user/schema/user.schema";


export enum EventType {
    USER_CREATED_EVENT = 'USER_CREATED_EVENT'
}


export interface UserCreatedEvent {
    user: UserDocument;
}
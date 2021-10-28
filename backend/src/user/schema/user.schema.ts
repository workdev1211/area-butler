import {ApiRequestContingent,} from '@area-butler-types/subscription-plan';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({required: true})
    fullname: string;

    @Prop({required: true, unique: true, index: true})
    email: string;

    @Prop({type: Date, default: Date.now})
    createdAt: Date;

    @Prop({type: Date, required: false})
    consentGiven: Date;

    @Prop({type: Number, default: 0})
    requestsExecuted: number;

    @Prop({type: Array, default: []})
    requestContingents: ApiRequestContingent[];

    @Prop({required: false})
    stripeCustomerId: string;

}

export const retrieveTotalRequestContingent = (
  user: UserDocument,
  date: Date = new Date(),
) => {
  const contingents = user.requestContingents || [];

  return contingents.filter(
    c =>
      c.date.getFullYear() < date.getFullYear() ||
      (c.date.getFullYear() === date.getFullYear() &&
        c.date.getMonth() <= date.getMonth()),
  );
};

export const Userschema = SchemaFactory.createForClass(User);

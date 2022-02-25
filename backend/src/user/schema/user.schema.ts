import {ApiRequestContingent,} from '@area-butler-types/subscription-plan';
import { ApiShowTour } from '@area-butler-types/types';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import { initialShowTour } from '../../../../shared/constants/constants';

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

    @Prop({type: Object, default: {...initialShowTour}})
    showTour: ApiShowTour;

    @Prop({required: false})
    logo: string;

    @Prop({required: false})
    mapIcon: string;

    @Prop({required: false})
    color: string;
    
    @Prop({required: false})
    mapboxAccessToken: string;
    
    @Prop({required: false, type: Array, default: []})
    allowedUrls: string[];

    @Prop({required: false, type: Array, default: []})
    additionalMapBoxStyles: {key: string, label: string}[];

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

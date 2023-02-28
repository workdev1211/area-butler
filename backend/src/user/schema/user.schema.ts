import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ApiRequestContingent } from '@area-butler-types/subscription-plan';
import {
  ApiShowTour,
  IApiUserExportFont,
  IApiUserPoiIcons,
  IApiUserUsageStatistics,
} from '@area-butler-types/types';
import { initialShowTour } from '../../../../shared/constants/constants';
import { SubscriptionDocument } from './subscription.schema';

export type UserDocument = User &
  Document & {
    subscription?: SubscriptionDocument;
    parentUser?: UserDocument;
    poiIcons?: IApiUserPoiIcons;
  };

@Schema()
export class User {
  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  consentGiven: Date;

  @Prop({ type: Number, default: 0 })
  requestsExecuted: number;

  @Prop({ type: Array, default: [] })
  requestContingents: ApiRequestContingent[];

  @Prop({ type: Object })
  usageStatistics: IApiUserUsageStatistics;

  @Prop()
  stripeCustomerId: string;

  @Prop()
  paypalCustomerId: string;

  @Prop({ type: Object, default: { ...initialShowTour } })
  showTour: ApiShowTour;

  @Prop()
  logo: string;

  @Prop()
  mapIcon: string;

  @Prop()
  color: string;

  @Prop({ type: Array })
  exportFonts: IApiUserExportFont[];

  @Prop()
  mapboxAccessToken: string;

  @Prop({ type: Array, default: [] })
  allowedUrls: string[];

  @Prop({ type: Array, default: [] })
  additionalMapBoxStyles: { key: string; label: string }[];

  @Prop()
  parentId: string;
}

export const retrieveTotalRequestContingent = (
  user: UserDocument,
  date: Date = new Date(),
): ApiRequestContingent[] => {
  const contingents = user.requestContingents || [];

  return contingents.filter(
    (c) =>
      c.date.getFullYear() < date.getFullYear() ||
      (c.date.getFullYear() === date.getFullYear() &&
        c.date.getMonth() <= date.getMonth()),
  );
};

export const UserSchema = SchemaFactory.createForClass(User);

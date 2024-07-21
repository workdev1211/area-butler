import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { ApiRequestContingent } from '@area-butler-types/subscription-plan';
import {
  ApiShowTour,
  IApiMapboxStyle,
  IApiUserExportFont,
  IApiUserPoiIcons,
  TApiUserApiConnections,
  LanguageTypeEnum,
} from '@area-butler-types/types';
import { initialShowTour } from '../../../../shared/constants/constants';
import { SubscriptionDocument } from './subscription.schema';
import { ApiKeyParamsSchema } from './api-key-params.schema';
import { IApiKeyParams } from '../../shared/types/external-api';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { availableCountries } from '../../../../shared/constants/location';

export type UserDocument = User & Document;

export const PARENT_USER_PATH = 'parentUser';

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  consentGiven: Date;

  @Prop({ type: Number, default: 0 })
  requestsExecuted: number;

  @Prop({ type: Array, default: [] })
  requestContingents: ApiRequestContingent[];

  @Prop({ type: String })
  stripeCustomerId: string;

  @Prop({ type: String })
  paypalCustomerId: string;

  @Prop({ type: Object, default: { ...initialShowTour } })
  showTour: ApiShowTour;

  @Prop({ type: String })
  logo: string;

  @Prop({ type: String })
  mapIcon: string;

  @Prop({ type: String })
  color: string;

  @Prop({ type: Array })
  exportFonts: IApiUserExportFont[];

  @Prop({ type: String })
  mapboxAccessToken: string;

  @Prop({ type: Array, default: [] })
  allowedUrls: string[];

  @Prop({ type: Array, default: [] })
  additionalMapBoxStyles: IApiMapboxStyle[];

  @Prop({ type: Object })
  apiConnections: TApiUserApiConnections;

  @Prop({
    type: Array,
    enum: availableCountries,
  })
  allowedCountries: Iso3166_1Alpha2CountriesEnum[];

  @Prop({ type: ApiKeyParamsSchema })
  apiKeyParams: IApiKeyParams;

  @Prop({ type: String })
  templateSnapshotId: string;

  @Prop({ type: String })
  parentId: string;

  @Prop({ type: Object })
  poiIcons?: IApiUserPoiIcons;

  @Prop({ type: String, enum: LanguageTypeEnum, default: LanguageTypeEnum.de })
  language: LanguageTypeEnum;

  parentUser?: UserDocument;
  subscription?: SubscriptionDocument;
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

UserSchema.virtual(PARENT_USER_PATH, {
  ref: User.name,
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

UserSchema.virtual('subscription');

// Left as an example
// UserSchema.pre('save', function (this: UserDocument, next): void {
//   delete this.poiIcons;
//   next();
// });

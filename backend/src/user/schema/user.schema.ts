import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

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
import { Subscription, SubscriptionDocument } from './subscription.schema';
import { ApiKeyParamsSchema } from './api-key-params.schema';
import { IApiKeyParams } from '../../shared/types/external-api';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { availableCountries } from '../../../../shared/constants/location';
import {
  COMPANY_PATH,
  foreignIdGetSet,
  PARENT_USER_PATH,
  SUBSCRIPTION_PATH,
} from '../../shared/constants/schema';
import { Company, TCompanyDocument } from '../../company/schema/company.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class User {
  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  companyId: string;

  @Prop({ type: Date })
  consentGiven: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String })
  paypalCustomerId: string;

  @Prop({ type: Array, default: [] })
  requestContingents: ApiRequestContingent[];

  @Prop({ type: Number, default: 0 })
  requestsExecuted: number;

  @Prop({ type: String })
  stripeCustomerId: string;

  company: TCompanyDocument;

  // CONFIG

  // TODO should be renamed to 'externalConnections'
  @Prop({ type: Object })
  apiConnections: TApiUserApiConnections;

  @Prop({ type: ApiKeyParamsSchema })
  apiKeyParams: IApiKeyParams;

  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({ type: String, enum: LanguageTypeEnum, default: LanguageTypeEnum.de })
  language: LanguageTypeEnum;

  // TODO should be renamed to 'studyTours'
  @Prop({ type: Object, default: { ...initialShowTour } })
  showTour: ApiShowTour;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  templateSnapshotId: string;

  // OLD

  // TODO should be renamed to 'extraMapboxStyles'
  @Prop({ type: Array, default: [] })
  additionalMapBoxStyles: IApiMapboxStyle[];

  @Prop({
    type: Array,
    enum: availableCountries,
  })
  allowedCountries: Iso3166_1Alpha2CountriesEnum[];

  @Prop({ type: String })
  color: string;

  @Prop({ type: Array })
  exportFonts: IApiUserExportFont[];

  @Prop({ type: String })
  logo: string;

  @Prop({ type: String })
  mapboxAccessToken: string;

  @Prop({ type: String })
  mapIcon: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
  parentId: string;

  @Prop({ type: Object })
  poiIcons: IApiUserPoiIcons;

  parentUser: UserDocument;
  subscription: SubscriptionDocument;
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

UserSchema.virtual(COMPANY_PATH, {
  ref: Company.name,
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});

UserSchema.virtual(SUBSCRIPTION_PATH, {
  ref: Subscription.name,
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Left as an example
// UserSchema.pre('save', function (this: UserDocument, next): void {
//   delete this.poiIcons;
//   next();
// });

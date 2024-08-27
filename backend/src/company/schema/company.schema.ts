import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as dayjs from 'dayjs';

import { CompanyConfigSchema } from './company-config.schema';
import { CompanySubscriptionSchema } from './company-subscription.schema';
import {
  ICompanyConfig,
  ICompanyIntParams,
  ICompanySchema,
  ICompanySubscription,
  TCompProdContingents,
} from '@area-butler-types/company';

export type TCompanyDocument = HydratedDocument<Company>;

@Schema({
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class Company implements ICompanySchema {
  @Prop({ type: CompanyConfigSchema })
  config?: ICompanyConfig;

  @Prop({ type: Object })
  integrationParams?: ICompanyIntParams;

  @Prop({ type: Object })
  productContingents?: TCompProdContingents;

  @Prop({
    type: CompanySubscriptionSchema,
    get: (subscription: ICompanySubscription): ICompanySubscription =>
      dayjs().isBefore(subscription?.expiresAt) ? subscription : undefined,
  })
  subscription?: ICompanySubscription;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

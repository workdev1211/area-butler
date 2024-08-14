import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
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

export type TCompanyDocument = Company & Document;

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

  @Prop({ type: CompanySubscriptionSchema })
  subscription?: ICompanySubscription;

  isSubscriptionActive: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.virtual('isSubscriptionActive').get(function (): boolean {
  return dayjs().isBefore(this.subscription?.expiresAt);
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ICompanySubscription } from '@area-butler-types/company';

@Schema({ _id: false })
class CompanySubscription implements ICompanySubscription {
  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const CompanySubscriptionSchema =
  SchemaFactory.createForClass(CompanySubscription);

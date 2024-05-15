import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as dayjs from 'dayjs';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IApiIntegrationUserSchema,
  IIntUserSubscription,
  TApiIntegrationUserConfig,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProductContingents,
  TApiIntegrationUserProductsUsed,
} from '@area-butler-types/integration-user';
import { IntUserSubscriptionSchema } from './int-user-subscription.schema';

export type TIntegrationUserDocument = IntegrationUser &
  Document & { parentUser?: TIntegrationUserDocument };

// TODO try to make 'parentUser' a populated field validated by the 'checkIsParent' method

@Schema({
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class IntegrationUser implements IApiIntegrationUserSchema {
  @Prop({ required: true, type: String })
  accessToken: string; // for AreaButler internal identification purposes

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ type: Object })
  config?: TApiIntegrationUserConfig;

  @Prop({ type: Boolean })
  isParent?: boolean;

  @Prop({ type: Object })
  parameters?: TApiIntegrationUserParameters;

  @Prop({ type: String })
  parentId?: string;

  @Prop({ type: Object })
  productContingents?: TApiIntegrationUserProductContingents;

  @Prop({ type: Object })
  productsUsed?: TApiIntegrationUserProductsUsed;

  @Prop({
    type: IntUserSubscriptionSchema,
    get: function (subscription: IIntUserSubscription): IIntUserSubscription {
      return this.parentUser && !this.isParent
        ? this.parentUser.subscription
        : subscription;
    },
  })
  subscription?: IIntUserSubscription;

  isSubscriptionActive?: boolean;
}

export const IntegrationUserSchema =
  SchemaFactory.createForClass(IntegrationUser);

IntegrationUserSchema.index(
  { integrationType: 1, integrationUserId: 1 },
  { unique: true },
);

IntegrationUserSchema.index(
  { integrationType: 1, accessToken: 1 },
  { unique: true },
);

IntegrationUserSchema.index({ updatedAt: -1 });

IntegrationUserSchema.virtual('isSubscriptionActive').get(function (): boolean {
  return dayjs().isBefore(this.subscription?.expiresAt);
});

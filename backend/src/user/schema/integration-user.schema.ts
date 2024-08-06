import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, FilterQuery, SchemaTypes } from 'mongoose';
import * as dayjs from 'dayjs';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IApiIntegrationUserSchema,
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
  IIntUserSubscription,
  TApiIntegrationUserConfig,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProductContingents,
  TApiIntegrationUserProductsUsed,
} from '@area-butler-types/integration-user';
import { IntUserSubscriptionSchema } from './int-user-subscription.schema';
import { PARENT_USER_PATH } from './user.schema';
import { IApiUserPoiIcons } from '@area-butler-types/types';
import { IntUserConfigSchema } from './int-user-config.schema';
import { foreignIdGetSet } from '../../shared/constants/schema';

export type TIntegrationUserDocument = IntegrationUser & Document;

@Schema({
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class IntegrationUser implements IApiIntegrationUserSchema {
  @Prop({ required: true, type: String })
  accessToken: string; // for AreaButler internal identification purposes

  @Prop({ type: IntUserConfigSchema })
  config: TApiIntegrationUserConfig;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ type: Boolean })
  isParent?: boolean;

  @Prop({ type: Object })
  parameters?: TApiIntegrationUserParameters;

  @Prop({
    type: SchemaTypes.ObjectId,
    ...foreignIdGetSet,
  })
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

  @Prop({ type: Object })
  poiIcons?: IApiUserPoiIcons;

  isSubscriptionActive?: boolean;
  parentUser?: TIntegrationUserDocument;
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

IntegrationUserSchema.virtual(PARENT_USER_PATH, {
  ref: IntegrationUser.name,
  localField: 'parentId',
  foreignField: '_id',
  match: (doc: TIntegrationUserDocument) => {
    const filterQuery: FilterQuery<TIntegrationUserDocument> = {
      integrationType: doc.integrationType,
    };

    switch (doc.integrationType) {
      case IntegrationTypesEnum.ON_OFFICE: {
        filterQuery['parameters.customerWebId'] = (
          doc.parameters as IApiIntUserOnOfficeParams
        ).customerWebId;
        break;
      }

      case IntegrationTypesEnum.PROPSTACK: {
        filterQuery['parameters.shopId'] = (
          doc.parameters as IApiIntUserPropstackParams
        ).shopId;
        break;
      }
    }

    return filterQuery;
  },
  justOne: true,
});

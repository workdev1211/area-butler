import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, FilterQuery, SchemaTypes } from 'mongoose';
import * as dayjs from 'dayjs';

import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IIntegrationUserSchema,
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
  IIntUserSubscription,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProductContingents,
  TApiIntegrationUserProductsUsed,
} from '@area-butler-types/integration-user';
import { IntUserSubscriptionSchema } from './int-user-subscription.schema';
import { UserConfigSchema } from './user-config.schema';
import {
  COMPANY_PATH,
  foreignIdGetSet,
  PARENT_USER_PATH,
} from '../../shared/constants/schema';
import { Company, TCompanyDocument } from '../../company/schema/company.schema';
import { IUserConfig } from '@area-butler-types/user';

export type TIntegrationUserDocument = HydratedDocument<IntegrationUser>;

@Schema({
  timestamps: true,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
})
export class IntegrationUser implements IIntegrationUserSchema {
  @Prop({ required: true, type: String })
  accessToken: string; // for AreaButler internal identification purposes

  @Prop({
    type: SchemaTypes.ObjectId,
    required: true,
    ...foreignIdGetSet,
  })
  companyId: string;

  @Prop({ type: UserConfigSchema })
  config: IUserConfig;

  @Prop({ required: true, type: String, enum: IntegrationTypesEnum })
  integrationType: IntegrationTypesEnum;

  @Prop({ required: true, type: String })
  integrationUserId: string;

  @Prop({ type: Object })
  parameters?: TApiIntegrationUserParameters;

  company?: TCompanyDocument;

  // OLD

  @Prop({ type: Boolean })
  isParent?: boolean;

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
    get: function (
      userSubscription: IIntUserSubscription,
    ): IIntUserSubscription {
      const subscription =
        this.parentUser && !this.isParent
          ? this.parentUser.subscription
          : userSubscription;

      return dayjs().isBefore(subscription?.expiresAt)
        ? subscription
        : undefined;
    },
  })
  subscription?: IIntUserSubscription;

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

IntegrationUserSchema.virtual(COMPANY_PATH, {
  ref: Company.name,
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});

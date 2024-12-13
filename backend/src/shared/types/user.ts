import { Types } from 'mongoose';

import { UserDocument } from '../../user/schema/user.schema';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';
import { TApiIntegrationUserParameters } from '@area-butler-types/integration-user';

export type TUnitedUser<
  T extends TApiIntegrationUserParameters = TApiIntegrationUserParameters,
> = (UserDocument | TIntegrationUserDocument) & { parameters?: T };

export type TIntUserObj<
  T extends TApiIntegrationUserParameters = TApiIntegrationUserParameters,
> = IntegrationUser & { _id: Types.ObjectId } & { parameters?: T };

import { FilterQuery, HydratedDocument, Types } from 'mongoose';

import { TUnitedUser } from '../types/user';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

type TInjectUserFilterQuery<T> = FilterQuery<
  HydratedDocument<T> & {
    userId?: Types.ObjectId;
    ['integrationParams.integrationType']?: IntegrationTypesEnum;
    ['integrationParams.integrationUserId']?: string;
  }
>;

export const injectUserParams = (user: TUnitedUser, obj = {}): object => {
  const isIntegrationUser = 'integrationUserId' in user;

  Object.assign(
    obj,
    isIntegrationUser
      ? {
          integrationParams: {
            integrationUserId: user.integrationUserId,
            integrationType: user.integrationType,
          },
        }
      : { userId: user.id },
  );

  return obj;
};

export const injectUserFilter = <T>(
  user: TUnitedUser,
  filterQuery?: TInjectUserFilterQuery<T>,
): TInjectUserFilterQuery<T> => {
  const resFilterQuery: TInjectUserFilterQuery<T> = {
    ...(filterQuery || {}),
  };

  const isIntegrationUser = 'integrationUserId' in user;
  const userIds: (Types.ObjectId | string)[] = [];

  if (!isIntegrationUser) {
    userIds.push(user._id);

    if (user.parentUser) {
      userIds.push(user.parentUser._id);
    }

    resFilterQuery.userId =
      userIds.length === 1 ? userIds[0] : { $in: userIds };

    return resFilterQuery;
  }

  userIds.push(user.integrationUserId);

  if (user.parentUser) {
    userIds.push(user.parentUser.integrationUserId);
  }

  resFilterQuery['integrationParams.integrationUserId'] =
    userIds.length === 1 ? userIds[0] : { $in: userIds };
  resFilterQuery['integrationParams.integrationType'] = user.integrationType;

  return resFilterQuery;
};

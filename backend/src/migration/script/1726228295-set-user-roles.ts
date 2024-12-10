import { Model, ProjectionFields } from 'mongoose';

import { User, UserDocument } from '../../user/schema/user.schema';
import { UserRoleEnum } from '@area-butler-types/user';
import { IMigrationContext, MigrationService } from '../migration.service';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';

export const up = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  const userProjectQuery: ProjectionFields<
    UserDocument | TIntegrationUserDocument
  > = { id: 1, parentId: 1 };

  const processUser = (
    user: UserDocument | TIntegrationUserDocument,
  ): object => {
    return {
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            role: user.parentId ? UserRoleEnum.user : UserRoleEnum.admin,
          },
        },
      },
    };
  };

  // WebApp users
  const userModel: Model<UserDocument> = connection.models[User.name];

  await MigrationService.bulkProcess<UserDocument>({
    findQuery: userModel.find(undefined, userProjectQuery),
    model: userModel,
    processDocument: processUser,
  });

  // Integration users
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];

  await MigrationService.bulkProcess<TIntegrationUserDocument>({
    findQuery: intUserModel.find(undefined, userProjectQuery),
    model: intUserModel,
    processDocument: processUser,
  });
};

export const down = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  // WebApp users
  const userModel: Model<UserDocument> = connection.models[User.name];
  userModel.updateMany(undefined, { $unset: { role: 1 } });

  // Integration users
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];
  intUserModel.updateMany(undefined, { $unset: { role: 1 } });
};

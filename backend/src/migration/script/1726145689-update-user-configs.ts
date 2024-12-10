import { Model, ProjectionFields } from 'mongoose';

import { User, UserDocument } from '../../user/schema/user.schema';
import {
  LanguageTypeEnum,
  TApiUserExtConnections,
  TApiUserStudyTours,
} from '@area-butler-types/types';
import { IApiKeyParams } from '../../shared/types/external-api';
import { IUserConfig } from '@area-butler-types/user';
import { IMigrationContext, MigrationService } from '../migration.service';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';

export const up = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  // WebApp users
  const userModel: Model<UserDocument> = connection.models[User.name];

  const userProjectQuery: ProjectionFields<UserDocument> = {
    apiConnections: 1,
    apiKeyParams: 1,
    fullname: 1,
    language: 1,
    showTour: 1,
    templateSnapshotId: 1,
  };

  const processUser = (user: UserDocument): object => {
    const {
      apiConnections,
      apiKeyParams,
      fullname,
      language,
      showTour,
      templateSnapshotId,
    } = user.toObject() as UserDocument & {
      apiConnections: TApiUserExtConnections;
      apiKeyParams: IApiKeyParams;
      fullname: string;
      language: LanguageTypeEnum;
      showTour: TApiUserStudyTours;
      templateSnapshotId: string;
    };

    const config: IUserConfig = {
      apiKeyParams,
      fullname,
      language,
      templateSnapshotId,
      externalConnections: apiConnections,
      studyTours: showTour,
    };

    return {
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: { config },
          $unset: userProjectQuery,
        },
      },
    };
  };

  await MigrationService.bulkProcess<UserDocument>({
    bulkWriteOptions: { strict: false },
    findQuery: userModel.find(undefined, userProjectQuery),
    model: userModel,
    processDocument: processUser,
  });

  // Integration users
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];

  const processIntUser = (
    integrationUser: TIntegrationUserDocument,
  ): object => {
    return {
      updateOne: {
        filter: { _id: integrationUser._id },
        update: {
          $rename: { 'config.showTour': 'config.studyTours' },
        },
      },
    };
  };

  await MigrationService.bulkProcess<TIntegrationUserDocument>({
    findQuery: intUserModel.find(
      { 'config.showTour': { $exists: true } },
      { id: 1 },
    ),
    model: intUserModel,
    processDocument: processIntUser,
  });
};

export const down = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  // WebApp users
  const userModel: Model<UserDocument> = connection.models[User.name];

  const userProjectQuery: ProjectionFields<UserDocument> = {
    config: 1,
  };

  const processUser = (user: UserDocument): object => {
    const {
      config: {
        apiKeyParams,
        fullname,
        language,
        templateSnapshotId,
        externalConnections,
        studyTours,
      },
    } = user.toObject();

    const updateQuery = {
      apiKeyParams,
      fullname,
      language,
      templateSnapshotId,
      apiConnections: externalConnections,
      showTour: studyTours,
    };

    return {
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: updateQuery,
          $unset: userProjectQuery,
        },
      },
    };
  };

  await MigrationService.bulkProcess<UserDocument>({
    bulkWriteOptions: { strict: false },
    findQuery: userModel.find(undefined, userProjectQuery),
    model: userModel,
    processDocument: processUser,
  });

  // Integration users
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];

  const processIntUser = (
    integrationUser: TIntegrationUserDocument,
  ): object => {
    return {
      updateOne: {
        filter: { _id: integrationUser._id },
        update: {
          $rename: { 'config.studyTours': 'config.showTour' },
        },
      },
    };
  };

  await MigrationService.bulkProcess<TIntegrationUserDocument>({
    findQuery: intUserModel.find(
      { 'config.studyTours': { $exists: true } },
      { id: 1 },
    ),
    model: intUserModel,
    processDocument: processIntUser,
  });
};

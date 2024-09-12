import { Model, ProjectionFields } from 'mongoose';

import { IMigrationContext, MigrationService } from '../migration.service';
import { User, UserDocument } from '../../user/schema/user.schema';
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
    additionalMapBoxStyles: 1,
    allowedCountries: 1,
    color: 1,
    exportFonts: 1,
    logo: 1,
    mapboxAccessToken: 1,
    mapIcon: 1,
    poiIcons: 1,
  };

  const processUser = async (user: UserDocument): Promise<void> => {
    await userModel.updateOne({ _id: user._id }, [
      { $unset: Object.keys(userProjectQuery) },
    ]);
  };

  await MigrationService.batchProcess<UserDocument>({
    findQuery: userModel.find({ parentId: { $exists: true } }, { id: 1 }),
    processDocumentAsync: processUser,
  });

  // Integration users
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];

  const intUserProjectQuery: ProjectionFields<TIntegrationUserDocument> = {
    poiIcons: 1,
    'config.allowedCountries': 1,
    'config.color': 1,
    'config.exportMatching': 1,
    'config.extraMapboxStyles': 1,
    'config.isSpecialLink': 1,
    'config.logo': 1,
    'config.mapboxAccessToken': 1,
    'config.mapIcon': 1,
  };

  const processIntUser = async (
    integrationUser: TIntegrationUserDocument,
  ): Promise<void> => {
    await intUserModel.updateOne({ _id: integrationUser._id }, [
      { $unset: Object.keys(intUserProjectQuery) },
    ]);
  };

  await MigrationService.batchProcess<TIntegrationUserDocument>({
    findQuery: intUserModel.find({ parentId: { $exists: true } }, { id: 1 }),
    processDocumentAsync: processIntUser,
  });
};

export const down = (): Promise<void> => undefined;

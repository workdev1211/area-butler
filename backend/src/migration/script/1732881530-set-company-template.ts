import { Model, ProjectionFields, FilterQuery } from 'mongoose';

import { User, UserDocument } from '../../user/schema/user.schema';
import { IMigrationContext, MigrationService } from '../migration.service';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';
import { TUnitedUser } from '../../shared/types/user';
import { COMPANY_PATH } from '../../shared/constants/schema';
import { Company, TCompanyDocument } from '../../company/schema/company.schema';

export const up = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  const companyModel: Model<TCompanyDocument> = connection.models[Company.name];
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];
  const userModel: Model<UserDocument> = connection.models[User.name];

  const processUser = async (user: TUnitedUser): Promise<void> => {
    await companyModel.updateOne({ _id: user.company._id }, [
      { $set: { 'config.templateSnapshotId': user.config.templateSnapshotId } },
    ]);

    if ('integrationUserId' in user) {
      await intUserModel.updateOne({ _id: user._id }, [
        { $unset: 'config.templateSnapshotId' },
      ]);
      return;
    }

    await userModel.updateOne({ _id: user._id }, [
      { $unset: 'config.templateSnapshotId' },
    ]);
  };

  const userFilterQuery: FilterQuery<TUnitedUser> = {
    parentId: { $exists: false },
    'config.templateSnapshotId': { $exists: true },
  };

  const userProjectQuery: ProjectionFields<TUnitedUser> = {
    id: 1,
    companyId: 1,
    'config.templateSnapshotId': 1,
  };

  await MigrationService.batchProcess<UserDocument>({
    findQuery: userModel
      .find(userFilterQuery, userProjectQuery)
      .populate(COMPANY_PATH),
    model: userModel,
    processDocumentAsync: processUser,
  });

  await MigrationService.batchProcess<TIntegrationUserDocument>({
    findQuery: intUserModel
      .find(userFilterQuery, userProjectQuery)
      .populate(COMPANY_PATH),
    model: intUserModel,
    processDocumentAsync: processUser,
  });
};

export const down = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  const userModel: Model<UserDocument> = connection.models[User.name];
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];
  const companyModel: Model<TCompanyDocument> = connection.models[Company.name];

  const processCompany = async (company: TCompanyDocument): Promise<void> => {
    const userFilterQuery: FilterQuery<TUnitedUser> = {
      companyId: company._id,
      parentId: { $exists: false },
    };

    const companyTemplateId = company.config.templateSnapshotId;

    if (company.integrationParams) {
      await intUserModel.updateOne(userFilterQuery, [
        { $set: { 'config.templateSnapshotId': companyTemplateId } },
      ]);
    } else {
      await userModel.updateOne(userFilterQuery, [
        { $set: { 'config.templateSnapshotId': companyTemplateId } },
      ]);
    }

    await companyModel.updateOne({ _id: company._id }, [
      { $unset: 'config.templateSnapshotId' },
    ]);
  };

  const companyProjQuery: ProjectionFields<TCompanyDocument> = {
    id: 1,
    integrationParams: 1,
    'config.templateSnapshotId': 1,
  };

  await MigrationService.batchProcess<TCompanyDocument>({
    findQuery: companyModel.find(
      { 'config.templateSnapshotId': { $exists: true } },
      companyProjQuery,
    ),
    model: companyModel,
    processDocumentAsync: processCompany,
  });
};

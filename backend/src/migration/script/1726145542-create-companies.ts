import { FilterQuery, Model } from 'mongoose';

import { User, UserDocument } from '../../user/schema/user.schema';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';
import { IMigrationContext, MigrationService } from '../migration.service';
import { Company, TCompanyDocument } from '../../company/schema/company.schema';
import { PARENT_USER_PATH } from '../../shared/constants/schema';
import { ICompanyIntParams } from '@area-butler-types/company';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
} from '@area-butler-types/integration-user';

export const up = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  return;

  // WebApp users
  const companyModel: Model<TCompanyDocument> = connection.models[Company.name];
  const userModel: Model<UserDocument> = connection.models[User.name];

  const processParentUser = async (user: UserDocument): Promise<void> => {
    const { id: companyId } = await companyModel.create({});

    await userModel.updateOne(
      { _id: user._id },
      {
        $set: { companyId },
      },
    );
  };

  const parentUserFilter: FilterQuery<UserDocument> = {
    $and: [{ companyId: { $exists: false } }, { parentId: { $exists: false } }],
  };

  await MigrationService.batchProcess<UserDocument>({
    findQuery: userModel.find(parentUserFilter, { id: 1 }),
    model: userModel,
    processDocumentAsync: processParentUser,
  });

  const processChildUser = async (user: UserDocument): Promise<void> => {
    const {
      parentUser: { companyId },
    } = user.toObject();

    await userModel.updateOne(
      { _id: user._id },
      {
        $set: { companyId },
      },
    );
  };

  const childUserFilter: FilterQuery<UserDocument> = {
    $and: [{ companyId: { $exists: false } }, { parentId: { $exists: true } }],
  };

  await MigrationService.batchProcess<UserDocument>({
    findQuery: userModel
      .find(childUserFilter, { parentId: 1 })
      .populate(PARENT_USER_PATH, { companyId: 1 }),
    model: userModel,
    processDocumentAsync: processChildUser,
  });

  // Integration users
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];

  const processParentIntUser = async (
    integrationUser: TIntegrationUserDocument,
  ): Promise<void> => {
    const { integrationType, parameters } = integrationUser.toObject();
    let integrationParams: ICompanyIntParams;

    switch (integrationType) {
      case IntegrationTypesEnum.ON_OFFICE: {
        integrationParams = {
          [IntegrationTypesEnum.ON_OFFICE]: {
            customerWebId: (parameters as IApiIntUserOnOfficeParams)
              .customerWebId,
          },
        };

        break;
      }

      case IntegrationTypesEnum.PROPSTACK: {
        integrationParams = {
          [IntegrationTypesEnum.PROPSTACK]: {
            shopId: (parameters as IApiIntUserPropstackParams).shopId,
          },
        };

        break;
      }

      default: {
        return;
      }
    }

    const { id: companyId } = await companyModel.create({
      integrationParams,
    });

    await intUserModel.updateOne(
      { _id: integrationUser._id },
      {
        $set: { companyId },
      },
    );
  };

  const parentIntUserFilter: FilterQuery<TIntegrationUserDocument> = {
    $and: [{ companyId: { $exists: false } }, { parentId: { $exists: false } }],
  };

  await MigrationService.batchProcess<TIntegrationUserDocument>({
    findQuery: intUserModel.find(parentIntUserFilter, {
      integrationType: 1,
      parameters: 1,
    }),
    model: intUserModel,
    processDocumentAsync: processParentIntUser,
  });

  const processChildIntUser = async (
    integrationUser: TIntegrationUserDocument,
  ): Promise<void> => {
    const {
      parentUser: { companyId },
    } = integrationUser.toObject();

    await intUserModel.updateOne(
      { _id: integrationUser._id },
      {
        $set: { companyId },
      },
    );
  };

  const childIntUserFilter: FilterQuery<TIntegrationUserDocument> = {
    $and: [{ companyId: { $exists: false } }, { parentId: { $exists: true } }],
  };

  await MigrationService.batchProcess<TIntegrationUserDocument>({
    findQuery: intUserModel
      .find(childIntUserFilter, { parentId: 1 })
      .populate(PARENT_USER_PATH, { companyId: 1 }),
    model: intUserModel,
    processDocumentAsync: processChildIntUser,
  });
};

export const down = (): void => undefined;

import { Model, ProjectionFields } from 'mongoose';

import { IMigrationContext, MigrationService } from '../migration.service';
import { User, UserDocument } from '../../user/schema/user.schema';
import { ICompanyConfig } from '@area-butler-types/company';
import { IApiMapboxStyle, IApiPoiIcons } from '@area-butler-types/types';
import { COMPANY_PATH } from '../../shared/constants/schema';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../../user/schema/integration-user.schema';
import { Company, TCompanyDocument } from '../../company/schema/company.schema';

export const up = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  const companyModel: Model<TCompanyDocument> = connection.models[Company.name];

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
    const {
      additionalMapBoxStyles,
      allowedCountries,
      color,
      exportFonts,
      logo,
      mapboxAccessToken,
      mapIcon,
      poiIcons,
      config,
    } = user.toObject() as unknown as ICompanyConfig & {
      additionalMapBoxStyles?: IApiMapboxStyle[];
      config: { templateSnapshotId: string };
    };

    const companyConfig: ICompanyConfig = {
      allowedCountries,
      color,
      exportFonts,
      logo,
      mapboxAccessToken,
      mapIcon,
      poiIcons,
      extraMapboxStyles: additionalMapBoxStyles,
      templateSnapshotId: config?.templateSnapshotId,
    };

    if (
      Object.values(companyConfig).every((val) =>
        [undefined, null].includes(val),
      )
    ) {
      return;
    }

    await companyModel.updateOne({ _id: user.company._id }, [
      { $set: { config: companyConfig } },
    ]);

    await userModel.updateOne({ _id: user._id }, [
      { $unset: Object.keys(userProjectQuery) },
    ]);
  };

  await MigrationService.batchProcess<UserDocument>({
    findQuery: userModel
      .find(
        { parentId: { $exists: false } },
        {
          ...userProjectQuery,
          companyId: 1,
          'config.templateSnapshotId': 1,
        },
      )
      .populate(COMPANY_PATH),
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
    'config.logo': 1,
    'config.mapboxAccessToken': 1,
    'config.mapIcon': 1,
  };

  const processIntUser = async (
    integrationUser: TIntegrationUserDocument,
  ): Promise<void> => {
    const { config, poiIcons } =
      integrationUser.toObject() as TIntegrationUserDocument & {
        poiIcons?: IApiPoiIcons;
      };

    if (!config && !poiIcons) {
      return;
    }

    const _config = config as ICompanyConfig;

    const companyConfig: ICompanyConfig = {
      poiIcons,
      allowedCountries: _config?.allowedCountries,
      color: _config?.color,
      exportMatching: _config?.exportMatching,
      extraMapboxStyles: _config?.extraMapboxStyles,
      logo: _config?.logo,
      mapboxAccessToken: _config?.mapboxAccessToken,
      mapIcon: _config?.mapIcon,
      templateSnapshotId: _config?.templateSnapshotId,
    };

    await companyModel.updateOne({ _id: integrationUser.company._id }, [
      { $set: { config: companyConfig } },
    ]);

    await intUserModel.updateOne({ _id: integrationUser._id }, [
      { $unset: Object.keys(intUserProjectQuery) },
    ]);
  };

  await MigrationService.batchProcess<TIntegrationUserDocument>({
    findQuery: intUserModel
      .find(
        { parentId: { $exists: false } },
        {
          ...intUserProjectQuery,
          companyId: 1,
          'config.templateSnapshotId': 1,
        },
      )
      .populate(COMPANY_PATH),
    processDocumentAsync: processIntUser,
  });
};

export const down = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  // WebApp users
  const userModel: Model<UserDocument> = connection.models[User.name];

  const processUser = async (user: UserDocument): Promise<void> => {
    if (!user.company.config) {
      return;
    }

    const {
      allowedCountries,
      color,
      exportFonts,
      logo,
      mapboxAccessToken,
      mapIcon,
      poiIcons,
      templateSnapshotId,
      extraMapboxStyles,
    } = user.company.config;

    const updateQuery = {
      allowedCountries,
      color,
      exportFonts,
      logo,
      mapboxAccessToken,
      mapIcon,
      poiIcons,
      additionalMapBoxStyles: extraMapboxStyles,
      'config.templateSnapshotId': templateSnapshotId,
    };

    user.company.set('config', undefined);
    await user.company.save();
    await userModel.updateOne({ _id: user._id }, [{ $set: updateQuery }]);
  };

  await MigrationService.batchProcess<UserDocument>({
    findQuery: userModel
      .find({ parentId: { $exists: false } }, { id: 1, companyId: 1 })
      .populate(COMPANY_PATH),
    processDocumentAsync: processUser,
  });

  // Integration users
  const intUserModel: Model<TIntegrationUserDocument> =
    connection.models[IntegrationUser.name];

  const processIntUser = async (
    integrationUser: TIntegrationUserDocument,
  ): Promise<void> => {
    if (!integrationUser.company.config) {
      return;
    }

    const {
      allowedCountries,
      color,
      exportMatching,
      extraMapboxStyles,
      logo,
      mapboxAccessToken,
      mapIcon,
      poiIcons,
      templateSnapshotId,
    } = integrationUser.company.config;

    const updateQuery = {
      poiIcons,
      'config.allowedCountries': allowedCountries,
      'config.color': color,
      'config.exportMatching': exportMatching,
      'config.extraMapboxStyles': extraMapboxStyles,
      'config.logo': logo,
      'config.mapboxAccessToken': mapboxAccessToken,
      'config.mapIcon': mapIcon,
      'config.templateSnapshotId': templateSnapshotId,
    };

    integrationUser.company.set('config', undefined);
    await integrationUser.company.save();

    await intUserModel.updateOne({ _id: integrationUser._id }, [
      { $set: updateQuery },
    ]);
  };

  await MigrationService.batchProcess<TIntegrationUserDocument>({
    findQuery: intUserModel
      .find({ parentId: { $exists: false } }, { id: 1, companyId: 1 })
      .populate(COMPANY_PATH),
    processDocumentAsync: processIntUser,
  });
};

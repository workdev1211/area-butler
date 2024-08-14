import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Query } from 'mongoose';

import { Company, TCompanyDocument } from '../company/schema/company.schema';
import { User, UserDocument } from '../user/schema/user.schema';
import { PARENT_USER_PATH } from '../shared/constants/schema';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../user/schema/integration-user.schema';
import { ICompanyIntParams } from '@area-butler-types/company';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  IApiIntUserOnOfficeParams,
  IApiIntUserPropstackParams,
} from '@area-butler-types/integration-user';

interface IBulkProcMainParams<T> {
  findQuery: Query<T[], T>;
  model: Model<T>;
  total: number;
}

type TBulkProcessParams<T> = IBulkProcMainParams<T> &
  (
    | {
        processDocument: (doc: T) => object;
        processDocumentAsync?: never;
      }
    | {
        processDocument?: never;
        processDocumentAsync: (doc: T) => Promise<object>;
      }
  );

type TBatchProcessParams<T> = IBulkProcMainParams<T> & {
  processDocumentAsync: (doc: T) => Promise<object>;
};

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<TCompanyDocument>,
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createCompanies(): Promise<void> {
    this.logger.log(`${this.createCompanies.name} migration started.`);

    // WebApp users

    const processParentUser = async (user: UserDocument): Promise<object> => {
      // Left for the future iteration
      // const {
      //   additionalMapBoxStyles,
      //   allowedCountries,
      //   color,
      //   exportFonts,
      //   logo,
      //   mapboxAccessToken,
      //   mapIcon,
      //   poiIcons,
      //   templateSnapshotId,
      // } = user.toObject();

      const { id: companyId } = await this.companyModel.create({
        // Left for the future iteration
        // config: {
        //   allowedCountries,
        //   color,
        //   exportFonts,
        //   logo,
        //   mapboxAccessToken,
        //   mapIcon,
        //   poiIcons,
        //   templateSnapshotId,
        //   extraMapboxStyles: additionalMapBoxStyles,
        // },
      });

      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: { companyId },
          },
        },
      };
    };

    const parentUserFilter: FilterQuery<UserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: false } },
      ],
    };

    await this.bulkProcess<UserDocument>({
      findQuery: this.userModel.find(parentUserFilter, { id: 1 }),
      model: this.userModel,
      processDocumentAsync: processParentUser,
      total: await this.userModel.count(parentUserFilter),
    });

    const processChildUser = (user: UserDocument): object => {
      const {
        parentUser: { companyId },
      } = user.toObject();

      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: { companyId },
          },
        },
      };
    };

    const childUserFilter: FilterQuery<UserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: true } },
      ],
    };

    await this.bulkProcess<UserDocument>({
      findQuery: this.userModel
        .find(childUserFilter, { parentId: 1 })
        .populate(PARENT_USER_PATH, { companyId: 1 }),
      model: this.userModel,
      processDocument: processChildUser,
      total: await this.userModel.count(childUserFilter),
    });

    // Integration users

    const processParentIntUser = async (
      integrationUser: TIntegrationUserDocument,
    ): Promise<object> => {
      const { config, integrationType, parameters } =
        integrationUser.toObject();

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

      // Left for the future iteration
      // const {
      //   allowedCountries,
      //   color,
      //   exportMatching,
      //   extraMapboxStyles,
      //   isSpecialLink,
      //   logo,
      //   mapboxAccessToken,
      //   mapIcon,
      //   templateSnapshotId,
      // } = config;

      const { id: companyId } = await this.companyModel.create({
        integrationParams,
        // Left for the future iteration
        // config: {
        //   allowedCountries,
        //   color,
        //   exportMatching,
        //   extraMapboxStyles,
        //   isSpecialLink,
        //   logo,
        //   mapboxAccessToken,
        //   mapIcon,
        //   templateSnapshotId,
        // },
      });

      return {
        updateOne: {
          filter: { _id: integrationUser._id },
          update: {
            $set: { companyId },
          },
        },
      };
    };

    const parentIntUserFilter: FilterQuery<TIntegrationUserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: false } },
      ],
    };

    await this.bulkProcess<TIntegrationUserDocument>({
      findQuery: this.integrationUserModel.find(parentIntUserFilter, {
        integrationType: 1,
        parameters: 1,
      }),
      model: this.integrationUserModel,
      processDocumentAsync: processParentIntUser,
      total: await this.integrationUserModel.count(parentIntUserFilter),
    });

    const processChildIntUser = (
      integrationUser: TIntegrationUserDocument,
    ): object => {
      const {
        parentUser: { companyId },
      } = integrationUser.toObject();

      return {
        updateOne: {
          filter: { _id: integrationUser._id },
          update: {
            $set: { companyId },
          },
        },
      };
    };

    const childIntUserFilter: FilterQuery<TIntegrationUserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: true } },
      ],
    };

    await this.bulkProcess<TIntegrationUserDocument>({
      findQuery: this.integrationUserModel
        .find(childIntUserFilter, { parentId: 1 })
        .populate(PARENT_USER_PATH, { companyId: 1 }),
      model: this.integrationUserModel,
      processDocument: processChildIntUser,
      total: await this.integrationUserModel.count(childIntUserFilter),
    });

    this.logger.log(`${this.createCompanies.name} migration finished.`);
  }

  private async batchProcess<T>({
    findQuery,
    processDocumentAsync,
    total,
  }: TBatchProcessParams<T>): Promise<void> {
    const limit = 20;

    for (let i = 0; i < total; i += limit) {
      const docs = await findQuery.limit(limit).skip(i).clone();

      for (const doc of docs) {
        await processDocumentAsync(doc);
      }
    }
  }

  private async bulkProcess<T>({
    findQuery,
    model,
    processDocument,
    processDocumentAsync,
    total,
  }: TBulkProcessParams<T>): Promise<void> {
    const limit = 20;

    for (let i = 0; i < total; i += limit) {
      const bulkOperations = [];

      const docs = await findQuery.limit(limit).skip(i).clone();

      for (const doc of docs) {
        bulkOperations.push(
          processDocument
            ? processDocument(doc)
            : await processDocumentAsync(doc),
        );
      }

      await model.bulkWrite(bulkOperations);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Query, HydratedDocument } from 'mongoose';

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

interface IBulkProcMainParams<T extends HydratedDocument<unknown>> {
  findQuery: Query<T[], T>;
  total: number;
}

type TBulkProcessParams<T extends HydratedDocument<unknown>> =
  IBulkProcMainParams<T> & {
    model: Model<T>;
  } & (
      | {
          processDocument: (doc: T) => object;
          processDocumentAsync?: never;
        }
      | {
          processDocument?: never;
          processDocumentAsync: (doc: T) => Promise<object>;
        }
    );

type TBatchProcessParams<T extends HydratedDocument<unknown>> =
  IBulkProcMainParams<T> & {
    processDocumentAsync: (doc: T) => Promise<void>;
  };

const BATCH_LIMIT = 100;

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

    const processParentUser = async (user: UserDocument): Promise<void> => {
      const { id: companyId } = await this.companyModel.create({});

      await this.userModel.updateOne(
        { _id: user._id },
        {
          $set: { companyId },
        },
      );
    };

    const parentUserFilter: FilterQuery<UserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: false } },
      ],
    };

    await this.batchProcess<UserDocument>({
      findQuery: this.userModel.find(parentUserFilter, { id: 1 }),
      processDocumentAsync: processParentUser,
      total: await this.userModel.count(parentUserFilter),
    });

    const processChildUser = async (user: UserDocument): Promise<void> => {
      const {
        parentUser: { companyId },
      } = user.toObject();

      await this.userModel.updateOne(
        { _id: user._id },
        {
          $set: { companyId },
        },
      );
    };

    const childUserFilter: FilterQuery<UserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: true } },
      ],
    };

    await this.batchProcess<UserDocument>({
      findQuery: this.userModel
        .find(childUserFilter, { parentId: 1 })
        .populate(PARENT_USER_PATH, { companyId: 1 }),
      processDocumentAsync: processChildUser,
      total: await this.userModel.count(childUserFilter),
    });

    // Integration users

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

      const { id: companyId } = await this.companyModel.create({
        integrationParams,
      });

      await this.integrationUserModel.updateOne(
        { _id: integrationUser._id },
        {
          $set: { companyId },
        },
      );
    };

    const parentIntUserFilter: FilterQuery<TIntegrationUserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: false } },
      ],
    };

    await this.batchProcess<TIntegrationUserDocument>({
      findQuery: this.integrationUserModel.find(parentIntUserFilter, {
        integrationType: 1,
        parameters: 1,
      }),
      processDocumentAsync: processParentIntUser,
      total: await this.integrationUserModel.count(parentIntUserFilter),
    });

    const processChildIntUser = async (
      integrationUser: TIntegrationUserDocument,
    ): Promise<void> => {
      const {
        parentUser: { companyId },
      } = integrationUser.toObject();

      await this.integrationUserModel.updateOne(
        { _id: integrationUser._id },
        {
          $set: { companyId },
        },
      );
    };

    const childIntUserFilter: FilterQuery<TIntegrationUserDocument> = {
      $and: [
        { companyId: { $exists: false } },
        { parentId: { $exists: true } },
      ],
    };

    await this.batchProcess<TIntegrationUserDocument>({
      findQuery: this.integrationUserModel
        .find(childIntUserFilter, { parentId: 1 })
        .populate(PARENT_USER_PATH, { companyId: 1 }),
      processDocumentAsync: processChildIntUser,
      total: await this.integrationUserModel.count(childIntUserFilter),
    });

    this.logger.log(`${this.createCompanies.name} migration finished.`);
  }

  private async batchProcess<T extends HydratedDocument<unknown>>({
    findQuery,
    processDocumentAsync,
    total,
  }: TBatchProcessParams<T>): Promise<void> {
    this.logger.log(`Batch processing of ${total} documents has started.`);
    const limit = BATCH_LIMIT;

    for (let i = 0; i < total; i += limit) {
      this.logger.log(`Batch processing documents from ${i} to ${i + limit}.`);
      const docs = await findQuery.limit(limit).skip(i).clone();

      for (const doc of docs) {
        this.logger.log(
          `Batch processing ${doc.id} document ('${doc.collection.name}' collection).`,
        );

        await processDocumentAsync(doc);
      }
    }

    this.logger.log(`Batch processing of ${total} documents has finished.`);
  }

  private async bulkProcess<T extends HydratedDocument<unknown>>({
    findQuery,
    model,
    processDocument,
    processDocumentAsync,
    total,
  }: TBulkProcessParams<T>): Promise<void> {
    this.logger.log(`Bulk processing of ${total} documents has started.`);
    const limit = BATCH_LIMIT;

    for (let i = 0; i < total; i += limit) {
      this.logger.log(`Bulk processing documents from ${i} to ${i + limit}.`);
      const bulkOperations = [];
      const docs = await findQuery.limit(limit).skip(i).clone();

      for (const doc of docs) {
        this.logger.log(
          `Bulk processing ${doc.id} document ('${doc.collection.name}' collection).`,
        );

        bulkOperations.push(
          processDocument
            ? processDocument(doc)
            : await processDocumentAsync(doc),
        );
      }

      await model.bulkWrite(bulkOperations);
    }

    this.logger.log(`Bulk processing of ${total} documents has finished.`);
  }
}

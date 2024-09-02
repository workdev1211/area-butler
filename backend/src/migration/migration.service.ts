import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Query,
  HydratedDocument,
  Connection,
  ProjectionFields,
} from 'mongoose';
import { Umzug, MongoDBStorage } from 'umzug';

import { CustomLogger } from './custom-logger.service';
import { COMPANY_PATH } from '../shared/constants/schema';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from '../user/schema/integration-user.schema';
import { ICompanyConfig } from '@area-butler-types/company';
import { IApiMapboxStyle, IApiPoiIcons } from '@area-butler-types/types';
import { User, UserDocument } from '../user/schema/user.schema';

export interface IMigrationContext {
  name: string;
  context: {
    connection: Connection;
  };

  path?: string;
}

interface IBulkProcMainParams<T extends HydratedDocument<unknown>> {
  findQuery: Query<T[], T>;
  total: number;
}

type TBulkProcessParams<T extends HydratedDocument<unknown>> =
  IBulkProcMainParams<T> & {
    model: Model<T>;
    bulkWriteOptions?: object;
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
  private static readonly logger = new Logger(MigrationService.name);

  private readonly umzug = new Umzug({
    context: { connection: this.connection },
    logger: new CustomLogger(MigrationService.name),
    migrations: {
      glob: ['script/*.js', { cwd: __dirname }],
      // Left just in case of possible future usage
      // Example of class / module processing
      // resolve: (params) => {
      //   const getModule = () => import(params.path);
      //
      //   return {
      //     name: params.name,
      //     up: async () => new (await getModule()).default().up(),
      //     down: async () => new (await getModule()).default().down(),
      //   };
      // },
    },
    storage: new MongoDBStorage({
      connection: this.connection,
    }),
  });

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getPendingMigrations(): Promise<string> {
    return (await this.umzug.pending()).reduce((result, { name }) => {
      result += result.length ? `\n${name}` : name;
      return result;
    }, '');
  }

  runPendingMigrations(): void {
    void this.umzug.up();
  }

  runNextMigration(): void {
    void this.umzug.up({ step: 1 });
  }

  revertLastMigration(): void {
    void this.umzug.down();
  }

  async processUserCompanyConfigs(): Promise<void> {
    MigrationService.logger.log(
      `${this.processUserCompanyConfigs.name} migration started.`,
    );

    // WebApp users

    const userProjectQuery: ProjectionFields<UserDocument> = {
      additionalMapBoxStyles: 1, // COUNT A SUPERPOSTITION
      allowedCountries: 1,
      color: 1,
      exportFonts: 1,
      logo: 1,
      mapboxAccessToken: 1,
      mapIcon: 1,
      poiIcons: 1,
    };

    const processUser = async (user: UserDocument): Promise<void> => {
      if (!user.parentId) {
        const userObj = user.toObject();

        const {
          additionalMapBoxStyles,
          allowedCountries,
          color,
          exportFonts,
          logo,
          mapboxAccessToken,
          mapIcon,
          poiIcons,
          config: { templateSnapshotId },
        } = userObj as unknown as ICompanyConfig & {
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
          templateSnapshotId,
          extraMapboxStyles: additionalMapBoxStyles,
        };

        user.company.set('config', companyConfig);
        await user.company.save();
      }

      await this.userModel.updateOne(
        { _id: user._id },
        { $unset: userProjectQuery },
      );
    };

    await MigrationService.batchProcess<UserDocument>({
      findQuery: this.userModel
        .find(
          {},
          { ...userProjectQuery, parentId: 1, 'config.templateSnapshotId': 1 },
        )
        .populate(COMPANY_PATH),
      processDocumentAsync: processUser,
      total: await this.userModel.count(),
    });

    // Integration users

    const intUserProjectQuery: ProjectionFields<TIntegrationUserDocument> = {
      poiIcons: 1,
      'config.allowedCountries': 1,
      'config.color': 1,
      'config.exportMatching': 1,
      'config.extraMapboxStyles': 1, // // COUNT A SUPERPOSTITION
      'config.isSpecialLink': 1,
      'config.logo': 1,
      'config.mapboxAccessToken': 1,
      'config.mapIcon': 1,
    };

    const processIntUser = async (
      integrationUser: TIntegrationUserDocument,
    ): Promise<void> => {
      if (!integrationUser.parentId) {
        const intUserObj = integrationUser.toObject();
        const { config, poiIcons } = intUserObj as TIntegrationUserDocument & {
          poiIcons?: IApiPoiIcons;
        };

        const {
          allowedCountries,
          color,
          exportMatching,
          extraMapboxStyles,
          isSpecialLink,
          logo,
          mapboxAccessToken,
          mapIcon,
          templateSnapshotId,
        } = config as ICompanyConfig;

        const companyConfig: ICompanyConfig = {
          allowedCountries,
          color,
          exportMatching,
          extraMapboxStyles,
          isSpecialLink,
          logo,
          mapboxAccessToken,
          mapIcon,
          poiIcons,
          templateSnapshotId,
        };

        integrationUser.company.set('config', companyConfig);
        await integrationUser.company.save();
      }

      await this.integrationUserModel.updateOne(
        { _id: integrationUser._id },
        { $unset: intUserProjectQuery },
      );
    };

    await MigrationService.batchProcess<TIntegrationUserDocument>({
      findQuery: this.integrationUserModel
        .find(
          {},
          {
            ...intUserProjectQuery,
            parentId: 1,
            'config.templateSnapshotId': 1,
          },
        )
        .populate(COMPANY_PATH),
      processDocumentAsync: processIntUser,
      total: await this.integrationUserModel.count(),
    });

    MigrationService.logger.log(
      `${this.processUserCompanyConfigs.name} migration finished.`,
    );
  }

  static async batchProcess<T extends HydratedDocument<unknown>>({
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

  static async bulkProcess<T extends HydratedDocument<unknown>>({
    bulkWriteOptions,
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

      await model.bulkWrite(bulkOperations, bulkWriteOptions);
    }

    this.logger.log(`Bulk processing of ${total} documents has finished.`);
  }
}

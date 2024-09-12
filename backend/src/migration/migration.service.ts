import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Model, Query, HydratedDocument, Connection } from 'mongoose';
import { Umzug, MongoDBStorage } from 'umzug';

import { CustomLogger } from './custom-logger.service';

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

  constructor(@InjectConnection() private readonly connection: Connection) {}

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

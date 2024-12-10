import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  Model,
  Query,
  HydratedDocument,
  Connection,
  Aggregate,
  PipelineStage,
} from 'mongoose';
import { Umzug, MongoDBStorage } from 'umzug';

import { CustomLogger } from './custom-logger.service';

export interface IMigrationContext {
  name: string;
  context: {
    connection: Connection;
  };

  path?: string;
}

type TBulkProcMainParams<T extends HydratedDocument<unknown>> = {
  model: Model<T>;
} & (
  | {
      findQuery: Query<T[], T>;
      pipelineStages?: never;
    }
  | {
      pipelineStages: PipelineStage[];
      findQuery?: never;
    }
);

type TBulkProcessParams<T extends HydratedDocument<unknown>> =
  TBulkProcMainParams<T> & {
    bulkWriteOptions?: object;
  } & (
      | {
          processDocument: (doc: unknown) => object | object[];
          processDocumentAsync?: never;
        }
      | {
          processDocumentAsync: (doc: unknown) => Promise<object | object[]>;
          processDocument?: never;
        }
    );

type TBatchProcessParams<T extends HydratedDocument<unknown>> =
  TBulkProcMainParams<T> & {
    processDocumentAsync: (doc: unknown) => Promise<void>;
  };

interface IGetCountQueryParams<T extends HydratedDocument<unknown>> {
  findQuery?: Query<T[], T>;
  model?: Model<T>;
  pipelineStages?: PipelineStage[];
}

type TAggregateOrQuery<T extends HydratedDocument<unknown>> =
  | Aggregate<any[]>
  | Query<T[], T>;

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
    model,
    pipelineStages,
    processDocumentAsync,
  }: TBatchProcessParams<T>): Promise<void> {
    const { count, query } = await MigrationService.getCountQuery<T>({
      findQuery,
      model,
      pipelineStages,
    });

    this.logger.log(`Batch processing of ${count} documents has started.`);
    const limit = BATCH_LIMIT;

    for (let i = 0; i < count; i += limit) {
      this.logger.log(`Batch processing documents from ${i} to ${i + limit}.`);

      const docs =
        'append' in query
          ? await query.limit(limit).skip(i)
          : await query.limit(limit).skip(i).clone();

      for (const doc of docs) {
        this.logger.log(
          `Batch processing ${doc.id} document ('${doc.collection.name}' collection).`,
        );

        await processDocumentAsync(doc);
      }
    }

    this.logger.log(`Batch processing of ${count} documents has finished.`);
  }

  static async bulkProcess<T extends HydratedDocument<unknown>>({
    bulkWriteOptions,
    findQuery,
    model,
    pipelineStages,
    processDocument,
    processDocumentAsync,
  }: TBulkProcessParams<T>): Promise<void> {
    const { count, query } = await MigrationService.getCountQuery<T>({
      findQuery,
      model,
      pipelineStages,
    });

    this.logger.log(`Bulk processing of ${count} documents has started.`);
    const limit = BATCH_LIMIT;

    for (let i = 0; i < count; i += limit) {
      this.logger.log(`Bulk processing documents from ${i} to ${i + limit}.`);
      const bulkOperations = [];

      const docs =
        'append' in query
          ? await query.limit(limit).skip(i)
          : await query.limit(limit).skip(i).clone();

      for (const doc of docs) {
        this.logger.log(
          `Bulk processing ${doc.id} document ('${doc.collection.name}' collection).`,
        );

        const processedDocument = processDocument
          ? processDocument(doc)
          : await processDocumentAsync(doc);

        if (Array.isArray(processedDocument)) {
          bulkOperations.push(...processedDocument);
        } else {
          bulkOperations.push(processedDocument);
        }
      }

      await model.bulkWrite(bulkOperations, bulkWriteOptions);
    }

    this.logger.log(`Bulk processing of ${count} documents has finished.`);
  }

  private static async getCountQuery<T extends HydratedDocument<unknown>>({
    findQuery,
    model,
    pipelineStages,
  }: IGetCountQueryParams<T>): Promise<{
    count: number;
    query: TAggregateOrQuery<T>;
  }> {
    const isAggregation = !!pipelineStages;
    let query: TAggregateOrQuery<T>;
    let count: number;

    if (isAggregation) {
      query = model.aggregate(pipelineStages);
      count = (await query.count('count'))[0].count;
    } else {
      query = findQuery;
      count = await model.countDocuments(query.getFilter());
    }

    return { count, query };
  }
}

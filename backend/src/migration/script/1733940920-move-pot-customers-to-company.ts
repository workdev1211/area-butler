import { Model, PipelineStage, Types } from 'mongoose';

import { IMigrationContext, MigrationService } from '../migration.service';
import {
  PotentialCustomer,
  PotentialCustomerDocument,
} from '../../potential-customer/schema/potential-customer.schema';

const userPipeline: PipelineStage[] = [
  {
    $match: {
      userId: { $exists: true },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'users',
    },
  },
  {
    $match: {
      users: { $ne: [] },
    },
  },
  {
    $project: {
      name: 1,
      companyId: { $first: '$users.companyId' },
    },
  },
  {
    $group: {
      _id: '$companyId',
      potentialCustomers: { $push: '$$ROOT' },
    },
  },
];

const intUserPipeline: PipelineStage[] = [
  {
    $match: {
      'integrationParams.integrationUserId': { $exists: true },
      'integrationParams.integrationType': { $exists: true },
    },
  },
  {
    $lookup: {
      from: 'integrationusers',
      let: {
        intUserId: '$integrationParams.integrationUserId',
        intType: '$integrationParams.integrationType',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$$intUserId', '$integrationUserId'] },
                { $eq: ['$$intType', '$integrationType'] },
              ],
            },
          },
        },
        {
          $project: {
            companyId: 1,
          },
        },
      ],
      as: 'users',
    },
  },
  {
    $match: {
      users: { $ne: [] },
    },
  },
  {
    $project: {
      name: 1,
      companyId: { $first: '$users.companyId' },
    },
  },
  {
    $group: {
      _id: '$companyId',
      potentialCustomers: { $push: '$$ROOT' },
    },
  },
];

export const up = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  const potCustomerModel: Model<PotentialCustomerDocument> =
    connection.models[PotentialCustomer.name];

  await MigrationService.bulkProcess<PotentialCustomerDocument>({
    bulkWriteOptions: { strict: false },
    model: potCustomerModel,
    pipelineStages: userPipeline,
    processDocument: processPotCustomers,
  });

  await MigrationService.bulkProcess<PotentialCustomerDocument>({
    bulkWriteOptions: { strict: false },
    model: potCustomerModel,
    pipelineStages: intUserPipeline,
    processDocument: processPotCustomers,
  });
};

export const down = (): void => undefined;

const processPotCustomers = ({
  _id: companyDbId,
  potentialCustomers,
}: {
  _id: Types.ObjectId;
  potentialCustomers: Array<{
    _id: Types.ObjectId;
    name: string;
  }>;
}): object[] => {
  const toBeRemoved: Types.ObjectId[] = [];

  const procPotCustomers = potentialCustomers.reduce<
    Map<string, Types.ObjectId>
  >((result, { name, _id: potentCustomerId }) => {
    if (result.has(name)) {
      toBeRemoved.push(potentCustomerId);
    } else {
      result.set(name, potentCustomerId);
    }

    return result;
  }, new Map());

  const bulkQuery: object[] = [];

  if (toBeRemoved.length) {
    bulkQuery.push(
      ...toBeRemoved.map((potentCustomerId) => ({
        deleteOne: { filter: { _id: potentCustomerId } },
      })),
    );
  }

  if (procPotCustomers.size) {
    bulkQuery.push(
      ...[...procPotCustomers.values()].map((potentCustomerId) => ({
        updateOne: {
          filter: { _id: potentCustomerId },
          update: {
            $set: { companyId: companyDbId },
            $unset: {
              integrationParams: 1,
              userId: 1,
            },
          },
        },
      })),
    );
  }

  return bulkQuery;
};

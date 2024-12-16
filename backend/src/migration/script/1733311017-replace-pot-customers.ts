import { Model, PipelineStage } from 'mongoose';

import { IMigrationContext, MigrationService } from '../migration.service';
import {
  PotentialCustomer,
  PotentialCustomerDocument,
} from '../../potential-customer/schema/potential-customer.schema';
import { defaultPotentialCustomers } from '../../shared/constants/potential-customers';
import { IApiIntegrationParams } from '@area-butler-types/integration';

const potCustomerMapper = new Map([
  ['Aktive Senioren', 'Senioren'],
  ['Etablierte Performer', 'Double Income No Kids'],
  ['Young Professionals', 'Singles'],
  ['(Junge) Familien', 'Familien'],
  ['Konservative / Pragmatische Mitte', 'Bürgerliche Haushalte'],
  ['Studierende', 'Studierende'],
]);

const newPotCustomers = ['Immobilieninteressent', 'Kapitalanleger'];

const userPipeline: PipelineStage[] = [
  {
    $match: {
      name: { $in: [...potCustomerMapper.keys()] },
      userId: { $exists: true },
    },
  },
  {
    $project: { name: 1, userId: 1 },
  },
  {
    $group: {
      _id: { $toString: '$userId' },
      potentialCustomers: { $push: '$$ROOT' },
    },
  },
];

const intUserPipeline: PipelineStage[] = [
  {
    $match: {
      name: { $in: [...potCustomerMapper.keys()] },
      integrationParams: { $exists: true },
    },
  },
  {
    $project: { integrationParams: 1, name: 1 },
  },
  {
    $group: {
      _id: {
        integrationUserId: '$integrationParams.integrationUserId',
        integrationType: '$integrationParams.integrationType',
      },
      potentialCustomers: { $push: '$$ROOT' },
    },
  },
];

const allPipeline: PipelineStage = {
  $match: {
    'potentialCustomers.name': {
      $all: [...potCustomerMapper.keys()],
    },
  },
};

const userAllPipeline: PipelineStage[] = [...userPipeline, allPipeline];
const intUserAllPipeline: PipelineStage[] = [...intUserPipeline, allPipeline];

export const up = async ({
  context: { connection },
}: IMigrationContext): Promise<void> => {
  const potCustomerModel: Model<PotentialCustomerDocument> =
    connection.models[PotentialCustomer.name];

  await MigrationService.bulkProcess<PotentialCustomerDocument>({
    model: potCustomerModel,
    pipelineStages: userAllPipeline,
    processDocument: processAllPotCustomers,
  });

  await MigrationService.bulkProcess<PotentialCustomerDocument>({
    model: potCustomerModel,
    pipelineStages: intUserAllPipeline,
    processDocument: processAllPotCustomers,
  });

  await MigrationService.bulkProcess<PotentialCustomerDocument>({
    model: potCustomerModel,
    pipelineStages: userPipeline,
    processDocument: processPotCustomers,
  });

  await MigrationService.bulkProcess<PotentialCustomerDocument>({
    model: potCustomerModel,
    pipelineStages: intUserPipeline,
    processDocument: processPotCustomers,
  });
};

export const down = (): void => undefined;

const processPotCustomers = ({
  potentialCustomers,
}: {
  potentialCustomers: PotentialCustomerDocument[];
}): object[] => {
  return potentialCustomers.reduce<object[]>(
    (result, { _id: potCustomerDbId, name }) => {
      const newName = potCustomerMapper.get(name);

      const newPotCustomer = defaultPotentialCustomers.find(
        ({ name: defaultName }) => defaultName === newName,
      );

      if (newPotCustomer) {
        result.push({
          updateOne: {
            filter: { _id: potCustomerDbId },
            update: {
              $set: newPotCustomer,
            },
          },
        });
      }

      return result;
    },
    [],
  );
};

const processAllPotCustomers = ({
  potentialCustomers,
  _id: groupingId,
}: {
  _id: IApiIntegrationParams | string;
  potentialCustomers: PotentialCustomerDocument[];
}): object[] => {
  const potCustomers = processPotCustomers({ potentialCustomers });

  potCustomers.push(
    ...defaultPotentialCustomers.reduce((result, defaultPotCustomer) => {
      if (newPotCustomers.includes(defaultPotCustomer.name)) {
        const document = structuredClone(defaultPotCustomer);

        if (typeof groupingId === 'string') {
          document.userId = groupingId;
        } else {
          const { integrationType, integrationUserId } = groupingId;

          document.integrationParams = {
            integrationType,
            integrationUserId,
          };
        }

        result.push({
          insertOne: { document },
        });
      }

      return result;
    }, []),
  );

  return potCustomers;
};

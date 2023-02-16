import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ApiUserIntegrationTypesEnum,
  TApiIntegrationUserParameters,
} from '@area-butler-types/types';
import {
  IntegrationUser,
  IntegrationUserDocument,
} from './schema/integration-user.schema';

@Injectable()
export class IntegrationUserService {
  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<IntegrationUserDocument>,
  ) {}

  async upsertUser(
    integrationUserId: string,
    integrationType: ApiUserIntegrationTypesEnum,
    parameters,
  ): Promise<IntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne({
      integrationUserId,
      integrationType,
    });

    if (existingUser) {
      return existingUser;
    }

    return new this.integrationUserModel({
      integrationUserId,
      integrationType,
      parameters,
    }).save();
  }

  async updateParameters(
    findQuery: unknown,
    parameters: TApiIntegrationUserParameters,
  ): Promise<IntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne(findQuery);

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    existingUser.parameters =
      typeof existingUser.parameters === 'object'
        ? { ...existingUser.parameters, ...parameters }
        : { ...parameters };

    return existingUser.save();
  }
}

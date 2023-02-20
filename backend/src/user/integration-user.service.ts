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
      return this.updateParameters(existingUser, parameters);
    }

    return new this.integrationUserModel({
      integrationUserId,
      integrationType,
      parameters,
    }).save();
  }

  async findUserAndUpdateParameters(
    findQuery: unknown,
    parameters: TApiIntegrationUserParameters,
  ): Promise<IntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne(findQuery);

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    return this.updateParameters(existingUser, parameters);
  }

  private async updateParameters(
    user: IntegrationUserDocument,
    parameters: TApiIntegrationUserParameters,
  ): Promise<IntegrationUserDocument> {
    user.parameters =
      typeof user.parameters === 'object'
        ? { ...user.parameters, ...parameters }
        : { ...parameters };

    return user.save();
  }
}

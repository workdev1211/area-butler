import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ApiUserIntegrationTypesEnum,
  TApiIntegrationUserParameters,
} from '@area-butler-types/types';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from './schema/integration-user.schema';

@Injectable()
export class IntegrationUserService {
  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
  ) {}

  async upsertUser(
    integrationUserId: string,
    integrationType: ApiUserIntegrationTypesEnum,
    parameters?: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
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
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne(findQuery);

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    return this.updateParameters(existingUser, parameters);
  }

  private async updateParameters(
    user: TIntegrationUserDocument,
    parameters: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    user.parameters =
      typeof user.parameters === 'object'
        ? { ...user.parameters, ...parameters }
        : { ...parameters };

    return user.save();
  }

  async findUser(
    integrationUserId: string,
    integrationType: ApiUserIntegrationTypesEnum,
  ): Promise<TIntegrationUserDocument> {
    const foundUser = await this.integrationUserModel.findOne({
      integrationUserId,
      integrationType,
    });

    if (!foundUser) {
      throw new HttpException('Unknown user!', 400);
    }

    return foundUser;
  }
}

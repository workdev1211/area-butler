import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import {
  IntegrationTypesEnum,
  TApiIntegrationUserParameters,
} from '@area-butler-types/types';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from './schema/integration-user.schema';
import { UserService } from './user.service';

@Injectable()
export class IntegrationUserService {
  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
    private readonly userService: UserService,
  ) {}

  async upsert(
    integrationUserId: string,
    integrationType: IntegrationTypesEnum,
    parameters?: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne({
      integrationUserId,
      integrationType,
    });

    if (existingUser) {
      return this.updateParams(existingUser, parameters);
    }

    // TODO add correct email
    const { _id: userId } = await this.userService.upsertUserForIntegration(
      'test@test.test',
    );

    return new this.integrationUserModel({
      integrationUserId,
      userId,
      integrationType,
      parameters,
    }).save();
  }

  async findOneOrFail(
    findQuery: FilterQuery<TIntegrationUserDocument>,
    integrationType: IntegrationTypesEnum,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne({
      ...findQuery,
      integrationType,
    });

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    return existingUser;
  }

  async findOneOrFailByExtendedClaim(
    extendedClaim: string,
    integrationType: IntegrationTypesEnum,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne({
      'parameters.extendedClaim': extendedClaim,
      integrationType,
    });

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    return existingUser;
  }

  private async updateParams(
    user: TIntegrationUserDocument,
    parameters: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    user.parameters =
      typeof user.parameters === 'object'
        ? { ...user.parameters, ...parameters }
        : { ...parameters };

    return user.save();
  }

  async findOneAndUpdateParams(
    findQuery: FilterQuery<TIntegrationUserDocument>,
    integrationType: IntegrationTypesEnum,
    parameters: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.findOneOrFail(findQuery, integrationType);

    return this.updateParams(existingUser, parameters);
  }
}

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  IntegrationTypesEnum,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProduct,
  TApiIntUserAvailableProductContingents,
  TApiIntUserOnOfficeProductContingents,
} from '@area-butler-types/types';
import {
  IntegrationUser,
  TIntegrationUserDocument,
} from './schema/integration-user.schema';

@Injectable()
export class IntegrationUserService {
  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>, // private readonly userService: UserService,
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

    return new this.integrationUserModel({
      integrationUserId,
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

  async updateParams(
    integrationUser: TIntegrationUserDocument,
    parameters: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    integrationUser.parameters =
      typeof integrationUser.parameters === 'object'
        ? { ...integrationUser.parameters, ...parameters }
        : { ...parameters };

    return integrationUser.save();
  }

  async addProductContingent(
    integrationUser: TIntegrationUserDocument,
    { type, quantity }: TApiIntegrationUserProduct,
  ): Promise<TIntegrationUserDocument> {
    if (!integrationUser.productContingents) {
      integrationUser.productContingents =
        {} as TApiIntUserOnOfficeProductContingents;
    }

    if (!integrationUser.productContingents[type]) {
      integrationUser.productContingents[type] = [];
    }

    integrationUser.productContingents[type].push({
      quantity,
      expiresAt: dayjs().add(1, 'year').toDate(),
    });

    return integrationUser.save();
  }

  getAvailableProductContingents({
    productContingents,
    productsUsed,
  }: TIntegrationUserDocument): TApiIntUserAvailableProductContingents {
    const nowDate = dayjs();

    return (
      productContingents &&
      Object.keys(productContingents).reduce((result, contingentName) => {
        const availableQuantity = productContingents[contingentName].reduce(
          (result, { quantity, expiresAt }) => {
            if (nowDate < dayjs(expiresAt)) {
              result += quantity;
            }

            return result;
          },
          0,
        );

        const usedQuantity = productsUsed
          ? productsUsed[contingentName] || 0
          : 0;

        const remainingQuantity = availableQuantity - usedQuantity;

        if (remainingQuantity > 0) {
          result[contingentName] = remainingQuantity;
        }

        return result;
      }, {} as TApiIntUserAvailableProductContingents)
    );
  }
}

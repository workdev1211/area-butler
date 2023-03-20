import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  IntegrationUser,
  TIntegrationUserDocument,
} from './schema/integration-user.schema';
import {
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from '@area-butler-types/integration';
import {
  IApiIntegrationUserProductContingent,
  TApiIntegrationUserConfig,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProduct,
  TApiIntegrationUserProductContingents,
  TApiIntUserAvailProdContingents,
  TApiIntUserUsageStatsParamNames,
} from '@area-butler-types/integration-user';
import { MapboxService } from '../client/mapbox/mapbox.service';
import { getProdContTypeByActType } from '../../../shared/functions/integration.functions';

@Injectable()
export class IntegrationUserService {
  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
    private readonly mapboxService: MapboxService,
  ) {}

  async upsert(
    integrationUserId: string,
    integrationType: IntegrationTypesEnum,
    accessToken: string,
    parameters: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne({
      integrationUserId,
      integrationType,
    });

    if (existingUser) {
      return this.updateParams(existingUser, accessToken, parameters);
    }

    return new this.integrationUserModel({
      integrationUserId,
      integrationType,
      accessToken,
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

  async findOneByAccessTokenOrFail(
    accessToken: string,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOne({
      accessToken,
    });

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    return existingUser;
  }

  async updateParams(
    integrationUser: TIntegrationUserDocument,
    accessToken: string,
    parameters: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    integrationUser.accessToken = accessToken;
    integrationUser.parameters =
      typeof integrationUser.parameters === 'object'
        ? { ...integrationUser.parameters, ...parameters }
        : { ...parameters };

    return integrationUser.save();
  }

  // TODO change to the increment way
  async addProductContingent(
    integrationUser: TIntegrationUserDocument,
    { type, quantity }: TApiIntegrationUserProduct,
  ): Promise<TIntegrationUserDocument> {
    if (!integrationUser.productContingents) {
      integrationUser.productContingents =
        {} as TApiIntegrationUserProductContingents;
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

  getAvailProdContingents({
    productContingents,
    productsUsed,
  }: TIntegrationUserDocument): TApiIntUserAvailProdContingents {
    return (
      productContingents &&
      Object.keys(productContingents).reduce(
        (result, productContingentType) => {
          const remainingQuantity = this.getAvailProdCont(
            productContingents[productContingentType],
            productsUsed[productContingentType],
          );

          if (remainingQuantity > 0) {
            result[productContingentType] = remainingQuantity;
          }

          return result;
        },
        {} as TApiIntUserAvailProdContingents,
      )
    );
  }

  async incrementUsageStatsParam(
    integrationUser: TIntegrationUserDocument,
    paramName: TApiIntUserUsageStatsParamNames,
  ): Promise<void> {
    const currentDate = dayjs();

    await this.integrationUserModel.updateOne(
      { _id: integrationUser.id },
      {
        $inc: {
          [`usageStatistics.${paramName}.${currentDate.year()}.${
            currentDate.month() + 1
          }.${currentDate.date()}`]: 1,
        },
      },
      { upsert: true },
    );
  }

  async incrementProductUsage(
    integrationUser: TIntegrationUserDocument,
    actionType: TIntegrationActionTypes,
  ): Promise<void> {
    const productContingentType = getProdContTypeByActType(
      integrationUser.integrationType,
      actionType,
    );

    if (!productContingentType) {
      return;
    }

    await this.integrationUserModel.updateOne(
      { _id: integrationUser.id },
      {
        $inc: {
          [`productsUsed.${productContingentType}`]: 1,
        },
      },
      { upsert: true },
    );
  }

  checkProdContAvailability(
    integrationUser: TIntegrationUserDocument,
    actionType: TIntegrationActionTypes,
  ): void {
    const productContingentType = getProdContTypeByActType(
      integrationUser.integrationType,
      actionType,
    );

    if (!productContingentType) {
      return;
    }

    if (
      !integrationUser.productContingents ||
      !integrationUser.productContingents[productContingentType]
    ) {
      throw new HttpException('Please, buy a corresponding product!', 402);
    }

    const remainingQuantity = this.getAvailProdCont(
      integrationUser.productContingents[productContingentType],
      (integrationUser.productsUsed &&
        integrationUser.productsUsed[productContingentType]) ||
        0,
    );

    if (!remainingQuantity) {
      throw new HttpException('Please, buy a corresponding product!', 402);
    }
  }

  // TODO change to the increment way
  async createMapboxAccessToken(
    integrationUser: TIntegrationUserDocument,
  ): Promise<TIntegrationUserDocument> {
    if (!integrationUser.config) {
      integrationUser.config = {} as TApiIntegrationUserConfig;
    }

    if (!integrationUser.config.mapboxAccessToken) {
      integrationUser.config.mapboxAccessToken =
        await this.mapboxService.createAccessToken(integrationUser.id);

      return integrationUser.save();
    }

    return integrationUser;
  }

  private getAvailProdCont(
    productContingent: IApiIntegrationUserProductContingent[],
    productUsed: number,
  ): number {
    const currentDate = dayjs();

    const availableQuantity = productContingent.reduce(
      (result, { quantity, expiresAt }) => {
        if (currentDate < dayjs(expiresAt)) {
          result += quantity;
        }

        return result;
      },
      0,
    );

    const usedQuantity = productUsed || 0;
    const remainingQuantity = availableQuantity - usedQuantity;

    return remainingQuantity > 0 ? remainingQuantity : 0;
  }
}

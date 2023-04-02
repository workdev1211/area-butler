import { HttpException, Injectable, Logger } from '@nestjs/common';
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
  IApiIntUserCreate,
  IApiIntUserUpdateParamsAndConfig,
  TApiIntegrationUserConfig,
  TApiIntegrationUserParameters,
  TApiIntegrationUserProduct,
  TApiIntUserAvailProdContingents,
  TApiIntUserUsageStatsParamNames,
} from '@area-butler-types/integration-user';
import { MapboxService } from '../client/mapbox/mapbox.service';
import { getProdContTypeByActType } from '../../../shared/functions/integration.functions';
import { ApiTourNamesEnum } from '@area-butler-types/types';
import { intUserInitShowTour } from '../../../shared/constants/integration-user';

@Injectable()
export class IntegrationUserService {
  private readonly logger = new Logger(IntegrationUserService.name);

  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
    private readonly mapboxService: MapboxService,
  ) {}

  async findOne(
    findQuery: FilterQuery<TIntegrationUserDocument>,
    integrationType: IntegrationTypesEnum,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel
      .findOne({
        ...findQuery,
        integrationType,
      })
      .sort({ updatedAt: -1 });
  }

  async findOneOrFail(
    findQuery: FilterQuery<TIntegrationUserDocument>,
    integrationType: IntegrationTypesEnum,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.findOne(findQuery, integrationType);

    if (!existingUser) {
      this.logger.error(findQuery, integrationType);
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
      this.logger.error(accessToken);
      throw new HttpException('Unknown user!', 400);
    }

    return existingUser;
  }

  async updateParamsAndConfig(
    integrationUser: TIntegrationUserDocument,
    { accessToken, parameters, config }: IApiIntUserUpdateParamsAndConfig,
  ): Promise<TIntegrationUserDocument> {
    const updatedFields: IApiIntUserUpdateParamsAndConfig = {
      accessToken,
      parameters:
        typeof integrationUser.parameters === 'object'
          ? { ...integrationUser.parameters, ...parameters }
          : { ...parameters },
    };

    if (config) {
      updatedFields.config =
        typeof integrationUser.config === 'object'
          ? { ...integrationUser.config, ...config }
          : { ...config };
    }

    return this.integrationUserModel.findByIdAndUpdate(
      integrationUser.id,
      updatedFields,
      { new: true },
    );
  }

  async create({
    integrationUserId,
    integrationType,
    accessToken,
    parameters,
    config,
  }: IApiIntUserCreate): Promise<TIntegrationUserDocument> {
    const processedConfig = config
      ? { ...config }
      : ({} as TApiIntegrationUserConfig);

    if (!processedConfig.showTour) {
      processedConfig.showTour = intUserInitShowTour;
    }

    return this.integrationUserModel.create({
      integrationUserId,
      integrationType,
      accessToken,
      parameters,
      config: processedConfig,
    });
  }

  async upsert(
    integrationUserId: string,
    integrationType: IntegrationTypesEnum,
    accessToken: string,
    parameters: TApiIntegrationUserParameters,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.integrationUserModel.findOneAndUpdate(
      { integrationUserId, integrationType },
      { accessToken, parameters },
    );

    return (
      existingUser ||
      this.create({
        integrationUserId,
        integrationType,
        accessToken,
        parameters,
      })
    );
  }

  async addProductContingents(
    integrationUserDbId: string,
    productContingents: TApiIntegrationUserProduct[],
  ): Promise<TIntegrationUserDocument> {
    if (
      !productContingents.length ||
      productContingents.some(({ type, quantity }) => !type || !quantity)
    ) {
      this.logger.error(productContingents);
      throw new HttpException('Incorrect product has been provided!', 400);
    }

    const updatePushQuery = productContingents.reduce(
      (result, { type, quantity }) => {
        if (!result[`productContingents.${type}`]) {
          result[`productContingents.${type}`] = { $each: [] };
        }

        result[`productContingents.${type}`].$each.push({
          quantity,
          expiresAt: dayjs().add(1, 'year').toDate(),
        });

        return result;
      },
      {},
    );

    return this.integrationUserModel.findByIdAndUpdate(
      integrationUserDbId,
      {
        $push: updatePushQuery,
      },
      { new: true },
    );
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
            productsUsed ? productsUsed[productContingentType] : 0,
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
    integrationUserDbId: string,
    paramName: TApiIntUserUsageStatsParamNames,
  ): Promise<TIntegrationUserDocument> {
    const currentDate = dayjs();

    return this.integrationUserModel.findByIdAndUpdate(
      integrationUserDbId,
      {
        $inc: {
          [`usageStatistics.${paramName}.${currentDate.year()}.${
            currentDate.month() + 1
          }.${currentDate.date()}`]: 1,
        },
      },
      { new: true },
    );
  }

  async incrementProductUsage(
    integrationUser: TIntegrationUserDocument,
    actionType: TIntegrationActionTypes,
  ): Promise<TIntegrationUserDocument> {
    const productContingentType = getProdContTypeByActType(
      integrationUser.integrationType,
      actionType,
    );

    if (!productContingentType) {
      return integrationUser;
    }

    return this.integrationUserModel.findByIdAndUpdate(
      integrationUser.id,
      {
        $inc: {
          [`productsUsed.${productContingentType}`]: 1,
        },
      },
      { new: true },
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

  async createMapboxAccessToken(
    integrationUser: TIntegrationUserDocument,
  ): Promise<TIntegrationUserDocument> {
    if (integrationUser.config.mapboxAccessToken) {
      return integrationUser;
    }

    const mapboxAccessToken = await this.mapboxService.createAccessToken(
      integrationUser.id,
    );

    return this.integrationUserModel.findByIdAndUpdate(
      integrationUser.id,
      {
        'config.mapboxAccessToken': mapboxAccessToken,
      },
      { new: true },
    );
  }

  async hideTour(
    integrationUser: TIntegrationUserDocument,
    tour?: ApiTourNamesEnum,
  ): Promise<TIntegrationUserDocument> {
    const showTour = { ...integrationUser.config.showTour };

    if (tour) {
      showTour[tour] = false;
    } else {
      Object.keys(integrationUser.config.showTour).forEach((tour) => {
        showTour[tour] = false;
      });
    }

    return this.integrationUserModel.findByIdAndUpdate(
      integrationUser.id,
      {
        'config.showTour': showTour,
      },
      { new: true },
    );
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

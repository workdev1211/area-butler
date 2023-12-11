import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery, FilterQuery, ProjectionFields } from 'mongoose';
import { BulkWriteResult } from 'mongodb';
import * as dayjs from 'dayjs';
import { EventEmitter2 } from 'eventemitter2';

import {
  IntegrationUser,
  TIntegrationUserDocument,
} from './schema/integration-user.schema';
import {
  IntegrationTypesEnum,
  TIntegrationActionTypes,
} from '@area-butler-types/integration';
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  IApiIntegrationUserProductContingent,
  IApiIntegrationUserSchema,
  IApiIntUserCreate,
  TApiIntegrationUserConfig,
  TApiIntegrationUserProduct,
  TApiIntUserAvailProdContingents,
} from '@area-butler-types/integration-user';
import { MapboxService } from '../client/mapbox/mapbox.service';
import {
  checkIsParent,
  getAvailProdContType,
} from '../../../shared/functions/integration.functions';
import { ApiTourNamesEnum } from '@area-butler-types/types';
import { intUserInitShowTour } from '../../../shared/constants/integration';
import { EventType } from '../event/event.types';

@Injectable()
export class IntegrationUserService {
  private readonly logger = new Logger(IntegrationUserService.name);

  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
    private readonly mapboxService: MapboxService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create({
    integrationUserId,
    integrationType,
    accessToken,
    parameters,
    config,
    parentId,
  }: IApiIntUserCreate): Promise<TIntegrationUserDocument> {
    const processedConfig = config
      ? { ...config }
      : ({} as TApiIntegrationUserConfig);

    if (!processedConfig.showTour) {
      processedConfig.showTour = intUserInitShowTour;
    }

    const integrationUser = await this.integrationUserModel.create({
      integrationUserId,
      integrationType,
      accessToken,
      parameters,
      config: processedConfig,
      parentId,
    });

    void this.eventEmitter.emitAsync(EventType.INTEGRATION_USER_CREATED_EVENT, {
      integrationUser,
    });

    return integrationUser;
  }

  async findOne(
    integrationType: IntegrationTypesEnum,
    filterQuery: FilterQuery<IApiIntegrationUserSchema>,
    projectQuery?: ProjectionFields<IApiIntegrationUserSchema>,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel
      .findOne(
        {
          ...filterQuery,
          integrationType,
        },
        projectQuery,
      )
      .sort({ updatedAt: -1 });
  }

  async findOneAndUpdate(
    integrationType: IntegrationTypesEnum,
    filterQuery: FilterQuery<IApiIntegrationUserSchema>,
    updateQuery: UpdateQuery<IApiIntegrationUserSchema>,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel.findOneAndUpdate(
      {
        ...filterQuery,
        integrationType,
      },
      updateQuery,
      { new: true },
    );
  }

  async findOneOrFail(
    integrationType: IntegrationTypesEnum,
    filterQuery: FilterQuery<IApiIntegrationUserSchema>,
  ): Promise<TIntegrationUserDocument> {
    const existingUser = await this.findOne(integrationType, filterQuery);

    if (!existingUser) {
      this.logger.error(filterQuery, integrationType);
      throw new HttpException('Unknown user!', 400);
    }

    return existingUser;
  }

  async findByTokenOrFail(
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

  async findByDbId(
    integrationUserDbId: string,
    projectQuery?: ProjectionFields<IApiIntegrationUserSchema>,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel.findById(
      integrationUserDbId,
      projectQuery,
    );
  }

  async findByDbIdAndUpdate(
    integrationUserDbId: string,
    updateQuery: UpdateQuery<IApiIntegrationUserSchema>,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel.findByIdAndUpdate(
      integrationUserDbId,
      updateQuery,
      { new: true },
    );
  }

  async updateConfig(
    integrationUser: TIntegrationUserDocument,
    config: Partial<TApiIntegrationUserConfig>,
  ): Promise<TIntegrationUserDocument> {
    Object.keys(config).forEach((key) => {
      // 'set' is used because we update properties of a nested object
      integrationUser.set(`config.${key}`, config[key] || undefined);
    });

    return integrationUser.save();
  }

  async bulkWrite(writes: any[]): Promise<BulkWriteResult> {
    return this.integrationUserModel.bulkWrite(writes);
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

    return this.findByDbIdAndUpdate(integrationUserDbId, {
      $push: updatePushQuery,
    });
  }

  // The main method to get the available product contingents
  async getAvailProdContingents(
    integrationUser: TIntegrationUserDocument,
  ): Promise<TApiIntUserAvailProdContingents> {
    let { productContingents, productsUsed } = integrationUser;

    if (integrationUser.parentId) {
      const parentUser =
        integrationUser.parentUser ||
        (await this.integrationUserModel.findById(integrationUser.parentId));

      if (!checkIsParent(integrationUser, parentUser)) {
        const errorMessage = 'The user info is incorrect!';
        let logMessage = `${errorMessage}\nIntegration user id: ${integrationUser.integrationUserId}\n`;
        logMessage += `Parent user id: ${parentUser.integrationUserId}.`;
        this.logger.error(logMessage);
        throw new HttpException(errorMessage, 400);
      }

      ({ productContingents, productsUsed } = parentUser);
    }

    const availProdContingents =
      productContingents &&
      Object.keys(productContingents).reduce(
        (result, productContingentType) => {
          const remainingQuantity = this.getAvailProdContQuantity(
            productContingents[productContingentType],
            productsUsed ? productsUsed[productContingentType] : 0,
          );

          if (remainingQuantity > 0) {
            result[productContingentType] = remainingQuantity;
          }

          return result;
        },
        {} as TApiIntUserAvailProdContingents,
      );

    return availProdContingents && Object.keys(availProdContingents).length
      ? availProdContingents
      : undefined;
  }

  async getAvailProdContTypeOrFail(
    integrationUser: TIntegrationUserDocument,
    actionType: TIntegrationActionTypes,
  ): Promise<ApiIntUserOnOfficeProdContTypesEnum> {
    const availProdContingents = await this.getAvailProdContingents(
      integrationUser,
    );

    const availProdContType = getAvailProdContType(
      integrationUser.integrationType,
      actionType,
      availProdContingents,
    );

    if (!availProdContType) {
      throw new HttpException('Please, buy a corresponding product!', 402);
    }

    return availProdContType;
  }

  private getAvailProdContQuantity(
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

  // The main method which increases the amount of a used contingent
  async incrementProductUsage(
    { id, parentId }: TIntegrationUserDocument,
    prodContType: ApiIntUserOnOfficeProdContTypesEnum,
  ): Promise<TIntegrationUserDocument> {
    return this.findByDbIdAndUpdate(parentId || id, {
      $inc: {
        [`productsUsed.${prodContType}`]: 1,
      },
    });
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

    return this.findByDbIdAndUpdate(integrationUser.id, {
      'config.mapboxAccessToken': mapboxAccessToken,
    });
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

    return this.findByDbIdAndUpdate(integrationUser.id, {
      'config.showTour': showTour,
    });
  }
}

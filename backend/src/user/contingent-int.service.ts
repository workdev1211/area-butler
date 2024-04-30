import { HttpException, Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';

import { TIntegrationUserDocument } from './schema/integration-user.schema';
import {
  IApiIntegrationUserProductContingent,
  TApiIntegrationUserProduct,
  TApiIntUserAvailProdContingents,
  TApiIntUserProdContType,
} from '@area-butler-types/integration-user';
import {
  checkIsParent,
  getAvailProdContType,
} from '../../../shared/functions/integration.functions';
import { IntegrationUserService } from './integration-user.service';
import { IntegrationActionTypeEnum } from '@area-butler-types/integration';

@Injectable()
export class ContingentIntService {
  private readonly logger = new Logger(ContingentIntService.name);

  constructor(
    private readonly integrationUserService: IntegrationUserService,
  ) {}

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

    return this.integrationUserService.findByDbIdAndUpdate(
      integrationUserDbId,
      {
        $push: updatePushQuery,
      },
    );
  }

  // The main method to get the available product contingents
  async getAvailProdContingents(
    integrationUser: TIntegrationUserDocument,
  ): Promise<TApiIntUserAvailProdContingents> {
    let { productContingents, productsUsed } = integrationUser;

    if (integrationUser.parentId) {
      const parentUser =
        integrationUser.parentUser ||
        (await this.integrationUserService.findByDbId(
          integrationUser.parentId,
        ));

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
    actionType: IntegrationActionTypeEnum,
  ): Promise<TApiIntUserProdContType> {
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
    prodContType: TApiIntUserProdContType,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserService.findByDbIdAndUpdate(parentId || id, {
      $inc: {
        [`productsUsed.${prodContType}`]: 1,
      },
    });
  }
}

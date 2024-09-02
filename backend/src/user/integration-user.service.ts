import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  ProjectionFields,
  Types,
  UpdateQuery,
} from 'mongoose';
import { BulkWriteResult } from 'mongodb';
import { EventEmitter2 } from 'eventemitter2';
import * as dayjs from 'dayjs';

import {
  IntegrationUser,
  TIntegrationUserDocument,
} from './schema/integration-user.schema';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  IApiIntUserCreate,
} from '@area-butler-types/integration-user';
import { MapboxService } from '../client/mapbox/mapbox.service';
import { ApiTourNamesEnum, LanguageTypeEnum } from '@area-butler-types/types';
import { EventType } from '../event/event.types';
import { COMPANY_PATH, PARENT_USER_PATH } from '../shared/constants/schema';
import { IApiUserConfig, IUserConfig } from '@area-butler-types/user';

@Injectable()
export class IntegrationUserService {
  private readonly logger = new Logger(IntegrationUserService.name);

  constructor(
    @InjectModel(IntegrationUser.name)
    private readonly integrationUserModel: Model<TIntegrationUserDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapboxService: MapboxService,
  ) {}

  async create({
    accessToken,
    companyId,
    config,
    integrationType,
    integrationUserId,
    isContingentProvided,
    isParent,
    parameters,
    parentId,
  }: IApiIntUserCreate): Promise<TIntegrationUserDocument> {
    const processedConfig = config ? { ...config } : {};

    const integrationUser = await this.integrationUserModel.create({
      accessToken,
      companyId,
      integrationType,
      integrationUserId,
      isParent,
      parameters,
      parentId,
      config: processedConfig,
      productContingents: isContingentProvided
        ? {
            [ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT]: [
              { quantity: 1, expiresAt: dayjs().add(1, 'year').toDate() },
            ],
          }
        : undefined,
    });

    void this.eventEmitter.emitAsync(EventType.INTEGRATION_USER_CREATED_EVENT, {
      integrationUser,
    });

    return integrationUser;
  }

  findOne(
    integrationType: IntegrationTypesEnum,
    filterQuery: FilterQuery<TIntegrationUserDocument>,
    projectQuery?: ProjectionFields<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.findOneCore(
      {
        ...filterQuery,
        integrationType,
      },
      projectQuery,
    );
  }

  async findOneOrFail(
    integrationType: IntegrationTypesEnum,
    filterQuery: FilterQuery<TIntegrationUserDocument>,
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
    const existingUser = await this.findOneCore({
      accessToken,
    });

    if (!existingUser) {
      this.logger.error(`${this.findByTokenOrFail.name} ${accessToken}`);
      throw new HttpException('Unknown user!', 400);
    }

    return existingUser;
  }

  findByDbId(
    integrationUserDbId: string,
    projectQuery?: ProjectionFields<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.findOneCore(
      { _id: new Types.ObjectId(integrationUserDbId) },
      projectQuery,
    );
  }

  findOneAndUpdate(
    integrationType: IntegrationTypesEnum,
    filterQuery: FilterQuery<TIntegrationUserDocument>,
    updateQuery: UpdateQuery<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.findOneAndUpdateCore(
      {
        ...filterQuery,
        integrationType,
      },
      updateQuery,
    );
  }

  findByDbIdAndUpdate(
    integrationUserDbId: string,
    updateQuery: UpdateQuery<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.findOneAndUpdateCore(
      { _id: new Types.ObjectId(integrationUserDbId) },
      updateQuery,
    );
  }

  async updateConfig(
    { _id: intUserDbId }: TIntegrationUserDocument,
    config: Partial<IUserConfig>,
  ): Promise<void> {
    const updateQuery: UpdateQuery<TIntegrationUserDocument> = {
      $set: {},
      $unset: {},
    };

    Object.entries(config).forEach(([key, value]) => {
      if (value) {
        updateQuery.$set[`config.${key}`] = value;
      } else {
        updateQuery.$unset[`config.${key}`] = 1;
      }
    });

    await this.integrationUserModel.updateOne(
      { _id: intUserDbId },
      updateQuery,
    );
  }

  bulkWrite(writes: any[]): Promise<BulkWriteResult> {
    return this.integrationUserModel.bulkWrite(writes);
  }

  async createMapboxAccessToken(
    integrationUser: TIntegrationUserDocument,
  ): Promise<TIntegrationUserDocument> {
    if (integrationUser.company.config?.mapboxAccessToken) {
      return integrationUser;
    }

    const mapboxAccessToken = await this.mapboxService.createAccessToken(
      integrationUser.companyId,
    );

    integrationUser.company.set('config.mapboxAccessToken', mapboxAccessToken);
    await integrationUser.company.save();

    return integrationUser;
  }

  hideTour(
    integrationUser: TIntegrationUserDocument,
    tour?: ApiTourNamesEnum,
  ): Promise<TIntegrationUserDocument> {
    const studyTours = { ...integrationUser.config.studyTours };

    if (tour) {
      studyTours[tour] = false;
    } else {
      Object.keys(studyTours).forEach((tour) => {
        studyTours[tour] = false;
      });
    }

    return this.findByDbIdAndUpdate(integrationUser.id, {
      'config.studyTours': studyTours,
    });
  }

  getIntUserResultConfig(
    integrationUser: TIntegrationUserDocument,
  ): IApiUserConfig {
    const {
      config,
      company: { config: companyConfig },
    } = integrationUser.toObject();

    return {
      ...companyConfig,
      ...config,
      language: config.language || LanguageTypeEnum.de,
    };
  }

  private async findOneCore(
    filterQuery: FilterQuery<TIntegrationUserDocument>,
    projectQuery?: ProjectionFields<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel
      .findOne(filterQuery, projectQuery)
      .sort({ updatedAt: -1 })
      .populate(PARENT_USER_PATH)
      .populate(COMPANY_PATH);
  }

  private async findOneAndUpdateCore(
    filterQuery: FilterQuery<TIntegrationUserDocument>,
    updateQuery: UpdateQuery<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel
      .findOneAndUpdate(filterQuery, updateQuery, { new: true })
      .populate(PARENT_USER_PATH)
      .populate(COMPANY_PATH);
  }
}

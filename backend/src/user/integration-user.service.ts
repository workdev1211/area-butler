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
  IIntUserConfig,
} from '@area-butler-types/integration-user';
import { MapboxService } from '../client/mapbox/mapbox.service';
import { ApiTourNamesEnum, LanguageTypeEnum } from '@area-butler-types/types';
import { EventType } from '../event/event.types';
import { getUnitedMapboxStyles } from '../shared/functions/shared';
import { COMPANY_PATH, PARENT_USER_PATH } from '../shared/constants/schema';

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

  async findOne(
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

  async findByDbId(
    integrationUserDbId: string,
    projectQuery?: ProjectionFields<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.findOneCore(
      { _id: new Types.ObjectId(integrationUserDbId) },
      projectQuery,
    );
  }

  async findOneAndUpdate(
    integrationType: IntegrationTypesEnum,
    filterQuery: FilterQuery<TIntegrationUserDocument>,
    updateQuery: UpdateQuery<TIntegrationUserDocument>,
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

  async findByDbIdAndUpdate(
    integrationUserDbId: string,
    updateQuery: UpdateQuery<TIntegrationUserDocument>,
  ): Promise<TIntegrationUserDocument> {
    return this.integrationUserModel.findByIdAndUpdate(
      integrationUserDbId,
      updateQuery,
      { new: true },
    );
  }

  async updateConfig(
    integrationUser: TIntegrationUserDocument,
    config: Partial<IIntUserConfig>,
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

  getIntUserResultConfig(
    integrationUser: TIntegrationUserDocument,
  ): IIntUserConfig {
    const { config, isParent, parentUser } = integrationUser.toObject();

    if (isParent || !parentUser) {
      return { ...config };
    }

    const { allowedCountries, extraMapboxStyles } = parentUser.config;

    return {
      ...config,
      language: config.language || LanguageTypeEnum.de,
      allowedCountries: config.allowedCountries || allowedCountries,
      extraMapboxStyles: getUnitedMapboxStyles(
        extraMapboxStyles,
        config.extraMapboxStyles,
      ),
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
}

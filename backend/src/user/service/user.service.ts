import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  ProjectionFields,
  Types,
  UpdateQuery,
} from 'mongoose';
import * as dayjs from 'dayjs';
import { plainToInstance } from 'class-transformer';

import {
  cumulativeRequestSubscriptionTypes,
  fixedRequestSubscriptionTypes,
} from '../../../../shared/constants/subscription-plan';
import { User, UserDocument } from '../schema/user.schema';
import { SubscriptionService } from './subscription.service';
import { ApiRequestContingentType } from '@area-butler-types/subscription-plan';
import {
  ApiTourNamesEnum,
  IApiUserExtConnectSettingsReq,
} from '@area-butler-types/types';
import { MapboxService } from '../../client/mapbox/mapbox.service';
import ApiUserDto from '../dto/api-user.dto';
import {
  COMPANY_PATH,
  PARENT_USER_PATH,
  SUBSCRIPTION_PATH,
} from '../../shared/constants/schema';
import { IUserConfig } from '@area-butler-types/user';
import UserConfigDto from '../dto/user-config.dto';
import ApiCompanyConfigDto from '../../company/dto/api-company-config.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mapboxService: MapboxService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  create(
    email: string,
    fullname: string,
    companyId: string,
  ): Promise<UserDocument> {
    return this.userModel.create({
      companyId,
      email,
      fullname,
      consentGiven: null,
    });
  }

  async findById({
    userId,
    projectQuery,
  }: {
    userId: string;
    projectQuery?: ProjectionFields<UserDocument>;
  }): Promise<UserDocument> {
    return this.findOneCore({ _id: new Types.ObjectId(userId) }, projectQuery);
  }

  async findByEmail(
    email: string,
    projectQuery?: ProjectionFields<UserDocument>,
  ): Promise<UserDocument> {
    return this.findOneCore({ email }, projectQuery);
  }

  async findByApiKey(apiKey: string): Promise<UserDocument> {
    return this.findOneCore({ 'config.apiKeyParams.apiKey': apiKey });
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserDocument> {
    return this.findOneCore({ stripeCustomerId });
  }

  async findByPaypalCustomerId(
    paypalCustomerId: string,
  ): Promise<UserDocument> {
    return this.findOneCore({ paypalCustomerId });
  }

  async updateExtConnections(
    userId: string,
    { connectType, ...connectSettings }: IApiUserExtConnectSettingsReq,
  ): Promise<UserDocument> {
    const updateQuery: UpdateQuery<UserDocument> = Object.keys(connectSettings)
      .length
      ? {
          $set: { [`apiConnections.${connectType}`]: connectSettings },
        }
      : { $unset: { [`apiConnections.${connectType}`]: 1 } };

    return this.userModel.findByIdAndUpdate(userId, updateQuery, { new: true });
  }

  async giveConsent(user: UserDocument): Promise<UserDocument> {
    if (!user.consentGiven) {
      user.consentGiven = new Date();
    }

    return user.save();
  }

  async hideTour(
    user: UserDocument,
    tour?: ApiTourNamesEnum,
  ): Promise<UserDocument> {
    const studyTours = { ...user.config.studyTours };

    if (tour) {
      studyTours[tour] = false;
    } else {
      Object.keys(studyTours).forEach((tour) => {
        studyTours[tour] = false;
      });
    }

    user.set('config.studyTours', studyTours);

    return user.save();
  }

  async setStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<UserDocument> {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { stripeCustomerId } },
    );

    return this.findById({ userId });
  }

  async incrementExecutedRequestCount(user: UserDocument): Promise<void> {
    if (user.parentId) {
      await this.userModel.updateOne(
        { _id: user.parentId },
        { $inc: { requestsExecuted: 1 } },
      );
    }

    await this.userModel.updateOne(
      { _id: user.id },
      { $inc: { requestsExecuted: 1 } },
    );
  }

  async addRequestContingentIncrease(
    user: UserDocument,
    amount: number,
  ): Promise<UserDocument> {
    user.requestContingents.push({
      type: ApiRequestContingentType.INCREASE,
      amount,
      date: new Date(),
    });

    await this.userModel.updateOne(
      { _id: user.id },
      { $set: { requestContingents: user.requestContingents } },
    );

    return user;
  }

  async setRequestContingents(
    user: UserDocument,
    untilMonthIncluded: Date,
  ): Promise<UserDocument> {
    const userSubscription =
      user.subscription ||
      (await this.subscriptionService.findActiveByUserId(user.id));

    if (!userSubscription) {
      return user;
    }

    const {
      plan: { limits: planLimits },
      price: { limits: priceLimits },
    } = this.subscriptionService.getApiSubscriptionPlanPrice(
      userSubscription.stripePriceId,
    );

    // TODO think about refactoring (maybe via the Strategy pattern)
    const numberOfRequests =
      priceLimits?.numberOfRequests?.amount?.value ||
      planLimits?.numberOfRequests?.amount?.value ||
      0;

    if (cumulativeRequestSubscriptionTypes.includes(userSubscription.type)) {
      await this.addMonthlyRequestContingents(
        user,
        untilMonthIncluded,
        numberOfRequests,
      );
    }

    if (fixedRequestSubscriptionTypes.includes(userSubscription.type)) {
      await this.setFixedRequestContingents(
        user.id,
        untilMonthIncluded,
        numberOfRequests,
      );
    }

    return user;
  }

  private async setFixedRequestContingents(
    userId: string,
    untilMonthIncluded: Date,
    numberOfRequests: number,
  ): Promise<void> {
    const currentDate = dayjs();

    const requestContingents = [
      {
        type: ApiRequestContingentType.RECURRENT,
        amount: numberOfRequests,
        date: currentDate.toDate(),
      },
    ];

    if (!dayjs(currentDate).isSame(untilMonthIncluded, 'month')) {
      requestContingents.push({
        type: ApiRequestContingentType.RECURRENT,
        amount: numberOfRequests,
        date: untilMonthIncluded,
      });
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { requestContingents } },
    );
  }

  private async addMonthlyRequestContingents(
    { id: userId, requestContingents: userRequestContingents }: UserDocument,
    untilMonthIncluded: Date,
    numberOfRequests: number,
  ): Promise<void> {
    let requestContingentDate = new Date();
    const requestContingents = [...userRequestContingents];

    while (
      requestContingentDate.getFullYear() < untilMonthIncluded.getFullYear() ||
      (requestContingentDate.getFullYear() ===
        untilMonthIncluded.getFullYear() &&
        requestContingentDate.getMonth() <= untilMonthIncluded.getMonth())
    ) {
      const existingMonthlyContingent = requestContingents.find(
        (c) =>
          c.type === ApiRequestContingentType.RECURRENT &&
          c.date.getMonth() === requestContingentDate.getMonth() &&
          c.date.getFullYear() === requestContingentDate.getFullYear(),
      );

      if (!existingMonthlyContingent) {
        requestContingents.push({
          type: ApiRequestContingentType.RECURRENT,
          amount: numberOfRequests,
          date: requestContingentDate,
        });
      } else {
        existingMonthlyContingent.amount = numberOfRequests;
      }

      const month = requestContingentDate.getMonth();
      const year = requestContingentDate.getFullYear();
      requestContingentDate = new Date();
      requestContingentDate.setFullYear(year);
      requestContingentDate.setMonth(month + 1);
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { requestContingents } },
    );
  }

  async updateConfig(
    user: UserDocument,
    config: Partial<IUserConfig>,
  ): Promise<UserDocument> {
    this.subscriptionService.checkSubscriptionViolation(
      user.subscription?.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.canCustomizeExport &&
        !subscriptionPlan.appFeatures.canCustomizeExport,
      'Angepasste Exporte sind im aktuellen Abonnement nicht verfügbar.',
    );

    const userConfig = plainToInstance(UserConfigDto, config, {
      excludeExtraneousValues: true,
      exposeDefaultValues: false,
      exposeUnsetFields: false,
    });

    const updateQuery: UpdateQuery<UserDocument> = Object.entries(
      userConfig,
    ).reduce(
      (result, [key, value]) => {
        if (value) {
          result.$set[`config.${key}`] = value;
        } else {
          result.$unset[`config.${key}`] = 1;
        }

        return result;
      },
      {
        $set: {},
        $unset: {},
      },
    );

    return this.findOneAndUpdateCore({ _id: user._id }, updateQuery);
  }

  async createMapboxAccessToken(user: UserDocument): Promise<UserDocument> {
    if (user.company.config?.mapboxAccessToken) {
      return user;
    }

    const mapboxAccessToken = await this.mapboxService.createAccessToken(
      user.companyId,
    );

    user.company.set('config.mapboxAccessToken', mapboxAccessToken);
    await user.company.save();

    return user;
  }

  async convertDocToApiUser(user: UserDocument): Promise<ApiUserDto> {
    const userObj = user.toObject();

    if (userObj.company.config) {
      const companyConfigDto = plainToInstance(
        ApiCompanyConfigDto,
        userObj.company.config,
        { exposeUnsetFields: false },
      );

      userObj.config = { ...companyConfigDto, ...userObj.config };
    }

    return plainToInstance(ApiUserDto, userObj, {
      exposeUnsetFields: false,
    });
  }

  async findOneCore(
    filterQuery: FilterQuery<UserDocument>,
    projectQuery?: ProjectionFields<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel
      .findOne(filterQuery, projectQuery)
      .sort({ updatedAt: -1 })
      .populate(COMPANY_PATH)
      .populate({
        path: PARENT_USER_PATH,
        populate: [SUBSCRIPTION_PATH],
      })
      .populate(SUBSCRIPTION_PATH);
  }

  private async findOneAndUpdateCore(
    filterQuery: FilterQuery<UserDocument>,
    updateQuery: UpdateQuery<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate(filterQuery, updateQuery, { new: true })
      .sort({ updatedAt: -1 })
      .populate(COMPANY_PATH)
      .populate({
        path: PARENT_USER_PATH,
        populate: [SUBSCRIPTION_PATH],
      })
      .populate(SUBSCRIPTION_PATH);
  }
}

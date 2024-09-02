import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import {
  FilterQuery,
  Model,
  ProjectionFields,
  Types,
  UpdateQuery,
} from 'mongoose';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';
import { plainToInstance } from 'class-transformer';

import {
  cumulativeRequestSubscriptionTypes,
  fixedRequestSubscriptionTypes,
  TRIAL_PRICE_ID,
} from '../../../shared/constants/subscription-plan';
import { User, UserDocument } from './schema/user.schema';
import { SubscriptionService } from './subscription.service';
import ApiUpsertUserDto from '../dto/api-upsert-user.dto';
import { ApiRequestContingentType } from '@area-butler-types/subscription-plan';
import {
  ApiTourNamesEnum,
  IApiUserExtConnectSettingsReq,
} from '@area-butler-types/types';
import ApiUserSettingsDto from '../dto/api-user-settings.dto';
import { EventType } from '../event/event.types';
import { MapboxService } from '../client/mapbox/mapbox.service';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import ApiUserDto from './dto/api-user.dto';
import {
  COMPANY_PATH,
  PARENT_USER_PATH,
  SUBSCRIPTION_PATH,
} from '../shared/constants/schema';
import { CompanyService } from '../company/company.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly companyService: CompanyService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapboxService: MapboxService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userSubscriptionPipe: UserSubscriptionPipe,
  ) {}

  async upsertUser(email: string, fullname: string): Promise<UserDocument> {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      return existingUser;
    }

    const { id: companyId } = await this.companyService.create();

    const newUser = await new this.userModel({
      companyId,
      email,
      fullname,
      consentGiven: null,
    }).save();

    // creates a new Stripe customer and default potential customer records
    void this.eventEmitter.emitAsync(EventType.USER_CREATED_EVENT, {
      user: newUser,
    });

    const {
      price: { interval },
    } = this.subscriptionService.getApiSubscriptionPlanPrice(TRIAL_PRICE_ID);

    // creates Trial subscription
    void this.eventEmitter.emitAsync(
      EventType.TRIAL_SUBSCRIPTION_UPSERT_EVENT,
      {
        user: newUser,
        endsAt: dayjs()
          .add(interval.value, interval.unit as ManipulateType)
          .toDate(),
      },
    );

    return newUser;
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

  async findByEmail(email: string): Promise<UserDocument> {
    return this.findOneCore({ email });
  }

  async findByApiKey(apiKey: string): Promise<UserDocument> {
    return this.findOneCore({ 'apiKeyParams.apiKey': apiKey });
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

  async patchUser(
    email: string,
    { fullname }: ApiUpsertUserDto,
  ): Promise<UserDocument> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new HttpException('Unknown user!', 400);
    }

    user.set('config.fullname', fullname);

    return user.save();
  }

  async updateApiConnections(
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

  async giveConsent(email: string): Promise<UserDocument> {
    const user = await this.upsertUser(email, email);

    if (!user) {
      throw new HttpException('Unknown user!', 400);
    }

    if (!user.consentGiven) {
      user.consentGiven = new Date();
    }

    return user.save();
  }

  async hideTour(
    email: string,
    tour?: ApiTourNamesEnum,
  ): Promise<UserDocument> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new HttpException('Unknown user!', 400);
    }

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

  async updateSettings(
    email: string,
    { templateSnapshotId, ...settings }: ApiUserSettingsDto,
  ): Promise<UserDocument> {
    const user = await this.findByEmail(email);
    await this.userSubscriptionPipe.transform(user);

    await this.subscriptionService.checkSubscriptionViolation(
      user.subscription.type,
      (subscriptionPlan) =>
        !user.subscription?.appFeatures?.canCustomizeExport &&
        !subscriptionPlan.appFeatures.canCustomizeExport,
      'Angepasste Exporte sind im aktuellen Abonnement nicht verfügbar.',
    );

    Object.keys(settings).forEach((key) => {
      user[key] = settings[key] || undefined;
    });

    user.set('config.templateSnapshotId', templateSnapshotId);

    return user.save();
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

  async transformToApiUser(user: UserDocument): Promise<ApiUserDto> {
    return plainToInstance(ApiUserDto, user.toObject(), {
      exposeUnsetFields: false,
    });
  }

  private async findOneCore(
    filterQuery: FilterQuery<UserDocument>,
    projectQuery?: ProjectionFields<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel
      .findOne(filterQuery, projectQuery)
      .sort({ updatedAt: -1 })
      .populate(COMPANY_PATH)
      .populate({
        path: PARENT_USER_PATH,
        populate: [
          {
            path: COMPANY_PATH,
            justOne: true,
          },
          {
            path: SUBSCRIPTION_PATH,
            justOne: true,
          },
        ],
      })
      .populate(SUBSCRIPTION_PATH);
  }
}

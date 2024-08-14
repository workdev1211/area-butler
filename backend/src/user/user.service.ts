import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model, ProjectionFields, UpdateQuery } from 'mongoose';
import * as dayjs from 'dayjs';
import { ManipulateType } from 'dayjs';
import { plainToInstance } from 'class-transformer';

import {
  cumulativeRequestSubscriptionTypes,
  fixedRequestSubscriptionTypes,
  TRIAL_PRICE_ID,
} from '../../../shared/constants/subscription-plan';
import { PARENT_USER_PATH, User, UserDocument } from './schema/user.schema';
import { SubscriptionService } from './subscription.service';
import ApiUpsertUserDto from '../dto/api-upsert-user.dto';
import { ApiRequestContingentType } from '@area-butler-types/subscription-plan';
import {
  ApiTourNamesEnum,
  IApiUserApiConnectSettingsReq,
} from '@area-butler-types/types';
import ApiUserSettingsDto from '../dto/api-user-settings.dto';
import { EventType } from '../event/event.types';
import { MapboxService } from '../client/mapbox/mapbox.service';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import ApiUserDto from './dto/api-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly subscriptionService: SubscriptionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapboxService: MapboxService,
    private readonly userSubscriptionPipe: UserSubscriptionPipe,
  ) {}

  async upsertUser(
    email: string,
    fullname: string,
    withAssets = false,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      if (!withAssets) {
        return existingUser;
      }

      const poiIcons = existingUser.poiIcons;

      if (
        poiIcons &&
        Object.keys(poiIcons).some((key) => poiIcons[key]?.length)
      ) {
        existingUser.poiIcons = poiIcons;
      }

      return existingUser;
    }

    const newUser = await new this.userModel({
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

  async patchUser(
    email: string,
    { fullname }: ApiUpsertUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new HttpException('Unknown user!', 400);
    }

    user.fullname = fullname;

    return user.save();
  }

  async updateApiConnections(
    userId: string,
    { connectType, ...connectSettings }: IApiUserApiConnectSettingsReq,
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

    const showTour = { ...user.showTour };

    if (tour) {
      showTour[tour] = false;
    } else {
      Object.keys(user.showTour).forEach((tour) => (showTour[tour] = false));
    }

    user.showTour = showTour;

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

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserDocument> {
    return this.userModel.findOne({ stripeCustomerId });
  }

  async findByPaypalCustomerId(
    paypalCustomerId: string,
  ): Promise<UserDocument> {
    return this.userModel.findOne({ paypalCustomerId });
  }

  async findById({
    userId,
    projectQuery,
    withAssets,
    withSubscription,
  }: {
    userId: string;
    projectQuery?: ProjectionFields<UserDocument>;
    withAssets?: boolean;
    withSubscription?: boolean;
  }): Promise<UserDocument> {
    const user = await this.userModel
      .findById(userId, projectQuery)
      .populate(PARENT_USER_PATH);

    if (!user || (!withAssets && !withSubscription)) {
      return user;
    }

    if (withAssets) {
      const poiIcons = user.poiIcons;

      if (
        poiIcons &&
        Object.keys(poiIcons).some((key) => poiIcons[key]?.length)
      ) {
        user.poiIcons = poiIcons;
      }
    }

    if (withSubscription) {
      user.subscription = await this.subscriptionService.findActiveByUserId(
        user.parentId || user.id,
      );
    }

    return user;
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
    settings: ApiUserSettingsDto,
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

    return user.save();
  }

  async createMapboxAccessToken(user: UserDocument): Promise<UserDocument> {
    if (!user.mapboxAccessToken) {
      user.mapboxAccessToken = await this.mapboxService.createAccessToken(
        user.id,
      );

      return user.save();
    }

    return user;
  }

  async fetchByApiKey(apiKey: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ 'apiKeyParams.apiKey': apiKey })
      .populate(PARENT_USER_PATH);
  }

  async transformToApiUser(user: UserDocument): Promise<ApiUserDto> {
    if (user.parentId && !user.parentUser) {
      user.parentUser = await this.findById({
        userId: user.parentId,
        withAssets: true,
        withSubscription: true,
      });
    }

    if (
      user.parentUser &&
      (!user.subscription ||
        user.subscription.id !== user.parentUser.subscription?.id)
    ) {
      user.subscription = user.parentUser.subscription;
    }

    if (!user.subscription && !user.parentUser) {
      user.subscription = await this.subscriptionService.findActiveByUserId(
        user.id,
      );
    }

    return plainToInstance(ApiUserDto, user, { exposeUnsetFields: false });
  }
}

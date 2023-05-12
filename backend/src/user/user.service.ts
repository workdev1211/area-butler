import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';
import { readdir, readFile } from 'fs/promises';
import { join as joinPath } from 'path';
import { ManipulateType } from 'dayjs';
import { Dirent } from 'node:fs';

import {
  cumulativeRequestSubscriptionTypes,
  fixedRequestSubscriptionTypes,
  TRIAL_PRICE_ID,
} from '../../../shared/constants/subscription-plan';
import {
  retrieveTotalRequestContingent,
  User,
  UserDocument,
} from './schema/user.schema';
import { SubscriptionService } from './subscription.service';
import ApiUpsertUserDto from '../dto/api-upsert-user.dto';
import {
  ApiRequestContingent,
  ApiRequestContingentType,
} from '@area-butler-types/subscription-plan';
import {
  ApiTourNamesEnum,
  IApiAddressesInRangeRequestStatus,
  IApiUserApiConnectionSettingsReq,
  IApiUserAssets,
  IApiUserPoiIcon,
} from '@area-butler-types/types';
import ApiUserSettingsDto from '../dto/api-user-settings.dto';
import { EventType } from '../event/event.types';
import { MapboxService } from '../client/mapbox/mapbox.service';
import { UserSubscriptionPipe } from '../pipe/user-subscription.pipe';
import { getImageTypeFromFileType } from '../shared/shared.functions';

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

      const { poiIcons } = await this.fetchUserAssets(existingUser.email);

      if (Object.keys(poiIcons).some((key) => poiIcons[key]?.length)) {
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
    this.eventEmitter.emitAsync(EventType.USER_CREATED_EVENT, {
      user: newUser,
    });

    const {
      price: { interval },
    } = this.subscriptionService.getApiSubscriptionPlanPrice(TRIAL_PRICE_ID);

    // creates Trial subscription
    this.eventEmitter.emitAsync(EventType.TRIAL_SUBSCRIPTION_UPSERT_EVENT, {
      user: newUser,
      endsAt: dayjs()
        .add(interval.value, interval.unit as ManipulateType)
        .toDate(),
    });

    return newUser;
  }

  async upsertUserForIntegration(
    email: string,
    fullname?: string,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      return existingUser;
    }

    return new this.userModel({
      email,
      fullname: fullname || email,
      consentGiven: null,
    }).save();
  }

  async patchUser(
    email: string,
    { fullname }: ApiUpsertUserDto,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email });

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    existingUser.fullname = fullname;

    return existingUser.save();
  }

  async updateApiConnections(
    userId: string,
    { connectionType, ...connectionSettings }: IApiUserApiConnectionSettingsReq,
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { [`apiConnections.${connectionType}`]: connectionSettings } },
      { new: true },
    );
  }

  async giveConsent(email: string): Promise<UserDocument> {
    const existingUser = await this.upsertUser(email, email);

    if (!existingUser) {
      throw new HttpException('Unknown user!', 400);
    }

    if (!existingUser.consentGiven) {
      existingUser.consentGiven = new Date();
    }

    return existingUser.save();
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

    return this.findById(userId);
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

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById({ _id: id });
  }

  async findByIdWithSubscription(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById({ _id: id });

    if (!user) {
      throw new HttpException('Unknown user!', 400);
    }

    user.subscription = await this.subscriptionService.findActiveByUserId(
      user.parentId || user.id,
    );

    return user;
  }

  async fetchByIdWithAssets(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById({ _id: id });

    const { poiIcons } = await this.fetchUserAssets(user.email);

    if (Object.keys(poiIcons).some((key) => poiIcons[key]?.length)) {
      user.poiIcons = poiIcons;
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
    const userSubscription = await this.subscriptionService.findActiveByUserId(
      user.parentId || user.id,
    );

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

  async getUserRequestContingent(
    user: UserDocument,
  ): Promise<ApiRequestContingent[]> {
    let requestContingent;

    if (user.parentId) {
      const parentUser = await this.findById(user.parentId);
      requestContingent = retrieveTotalRequestContingent(parentUser);
    } else {
      requestContingent = retrieveTotalRequestContingent(user);
    }

    return requestContingent;
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

    if (settings.logo) {
      user.logo = settings.logo;
    } else if (settings.logo === null) {
      user.logo = undefined;
    }

    if (settings.mapIcon) {
      user.mapIcon = settings.mapIcon;
    } else if (settings.logo === null) {
      user.mapIcon = undefined;
    }

    if (settings.color) {
      user.color = settings.color;
    } else if (settings.color === null) {
      user.color = undefined;
    }

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

  async onAddressesInRangeFetch(
    user: UserDocument,
    requestStatus: IApiAddressesInRangeRequestStatus,
  ): Promise<void> {
    const currentDate = new Date();

    if (user.parentId) {
      await this.userModel.updateOne(
        { _id: user.parentId },
        {
          $inc: {
            [`usageStatistics.addressesInRange.${currentDate.getUTCFullYear()}.${
              currentDate.getUTCMonth() + 1
            }.total`]: 1,
          },
        },
        { upsert: true },
      );
    }

    await this.userModel.updateOne(
      { _id: user.id },
      {
        $inc: {
          [`usageStatistics.addressesInRange.${currentDate.getUTCFullYear()}.${
            currentDate.getUTCMonth() + 1
          }.total`]: 1,
        },
        $push: {
          [`usageStatistics.addressesInRange.${currentDate.getUTCFullYear()}.${
            currentDate.getUTCMonth() + 1
          }.requests`]: {
            timestamp: currentDate.toISOString(),
            ...requestStatus,
          },
        },
      },
      { upsert: true, omitUndefined: true },
    );
  }

  private async fetchUserAssets(userEmail: string): Promise<IApiUserAssets> {
    const dirPath = joinPath(process.cwd(), `../shared/assets/${userEmail}`);
    const mapPoiIconPath = joinPath(dirPath, '/icons/poi/map');
    const menuPoiIconPath = joinPath(dirPath, '/icons/poi/menu');

    const mapPoiIcons = await this.fetchUserAsset(
      mapPoiIconPath,
      this.fetchUserPoiIcon,
    );

    const menuPoiIcons = await this.fetchUserAsset(
      menuPoiIconPath,
      this.fetchUserPoiIcon,
    );

    return { poiIcons: { mapPoiIcons, menuPoiIcons } };
  }

  private async fetchUserAsset<T>(
    dirPath: string,
    handleFetch: (filename: string, dirPath: string) => Promise<T>,
  ): Promise<Array<T>> {
    const dirContent: Dirent[] = await readdir(dirPath, {
      withFileTypes: true,
    }).catch(() => undefined);

    if (!dirContent?.length) {
      return;
    }

    return Promise.all(
      dirContent.map(({ name: filename }) => handleFetch(filename, dirPath)),
    );
  }

  private async fetchUserPoiIcon(
    filename: string,
    dirPath: string,
  ): Promise<IApiUserPoiIcon> {
    const name = filename.split('.');
    const type = name.pop();
    const file = await readFile(joinPath(dirPath, filename), {
      encoding: 'base64',
    });

    return {
      name: name.join('.'),
      file: `data:${getImageTypeFromFileType(type)};base64,${file}`,
    } as IApiUserPoiIcon;
  }
}

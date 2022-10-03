import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

import {
  Subscription,
  SubscriptionDocument,
} from './schema/subscription.schema';
import { configService } from '../config/config.service';
import {
  allSubscriptions,
  TRIAL_PRICE_ID,
} from '../../../shared/constants/subscription-plan';
import ApiSubscriptionPlanDto from '../dto/api-subscription-plan.dto';
import {
  ApiSubscriptionLimitsEnum,
  ApiSubscriptionPlanType,
  IApiSubscriptionLimitAmount,
  IApiSubscriptionLimitIncreaseParams,
  PaymentSystemTypeEnum,
} from '@area-butler-types/subscription-plan';
import {
  IPaymentItem,
  ISubscriptionPlanPrice,
  PaymentItemTypeEnum,
} from '../shared/subscription.types';
import { MailSenderService } from '../client/mail/mail-sender.service';
import {
  newUserBusinessPlusSubscriptionTemplateId,
  newUserPayPerUseSubscriptionTemplateId,
  subscriptionRenewalTemplateId,
} from '../shared/email.constants';
import { User, UserDocument } from './schema/user.schema';
import { EventType } from '../event/event.types';
import { EventEmitter2 } from 'eventemitter2';

interface ISubscriptionUpsertData {
  user: UserDocument;
  endsAt: Date;
  type: ApiSubscriptionPlanType;
  priceId: string;
  subscriptionId: string;
  paymentSystemType: PaymentSystemTypeEnum;
}

interface IActiveTrialSubscriptions {
  active: SubscriptionDocument[];
  trial: SubscriptionDocument[];
}

@Injectable()
export class SubscriptionService {
  private readonly logger: Logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly mailSenderService: MailSenderService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private getSubscriptionCancelUrl(
    paymentSystemType?: PaymentSystemTypeEnum,
  ): string {
    let subscriptionCancelUrl = `${configService.getBaseAppUrl()}/profile`;

    if (paymentSystemType === PaymentSystemTypeEnum.PAYPAL) {
      subscriptionCancelUrl = `https://${
        configService.getStripeEnv() !== 'prod' ? 'sandbox.' : ''
      }paypal.com/myaccount/autopay/`;
    }

    return subscriptionCancelUrl;
  }

  getApiSubscriptionPlanPrice(stripePriceId: string): ISubscriptionPlanPrice {
    const stripeEnv = configService.getStripeEnv();
    let foundPlanPrice;

    Object.values(allSubscriptions).find((subscriptionPlan) => {
      const foundPrice = subscriptionPlan.prices.find(
        ({ id }) => id[stripeEnv] === stripePriceId,
      );

      if (foundPrice) {
        foundPlanPrice = { plan: subscriptionPlan, price: foundPrice };
      }

      return !!foundPrice;
    });

    return foundPlanPrice;
  }

  getLimitIncreaseParams(
    itemPriceId: string,
  ): IApiSubscriptionLimitIncreaseParams {
    const stripeEnv = configService.getStripeEnv();
    let foundLimitIncreaseItem;

    Object.values(allSubscriptions).some(({ limits: planLimits, prices }) => {
      const hasPriceLimitIncreaseItem = prices.some(
        ({ limits: priceLimits }) => {
          return (
            priceLimits &&
            Object.keys(priceLimits).some((limitType) => {
              const priceLimitIncreaseItem = priceLimits[
                limitType
              ].increaseParams?.find(({ id }) => id[stripeEnv] === itemPriceId);

              if (priceLimitIncreaseItem) {
                foundLimitIncreaseItem = {
                  ...priceLimitIncreaseItem,
                  type: limitType,
                };
              }

              return !!priceLimitIncreaseItem;
            })
          );
        },
      );

      if (hasPriceLimitIncreaseItem) {
        return true;
      }

      // hasPlanLimitIncreaseItem
      return (
        planLimits &&
        Object.keys(planLimits).some((limitType) => {
          const planLimitIncreaseItem = planLimits[
            limitType
          ].increaseParams?.find(({ id }) => id[stripeEnv] === itemPriceId);

          if (planLimitIncreaseItem) {
            foundLimitIncreaseItem = {
              ...planLimitIncreaseItem,
              type: limitType,
            };
          }

          return !!planLimitIncreaseItem;
        })
      );
    });

    return foundLimitIncreaseItem;
  }

  // TODO think about refactoring as custom decorator
  checkSubscriptionViolation(
    subscriptionType: ApiSubscriptionPlanType,
    checkFunction: (subscription: ApiSubscriptionPlanDto) => boolean,
    errorMessage: string,
  ): void {
    if (checkFunction(allSubscriptions[subscriptionType])) {
      throw new HttpException(errorMessage, 400);
    }
  }

  async fetchUserSubscriptions(
    userId: string,
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ userId });
  }

  async countAllUserSubscriptions(userId: string): Promise<number> {
    return this.subscriptionModel.count({ userId });
  }

  async renewSubscription(
    subscriptionId: string,
    newEndDate: Date,
    paymentSystemType: PaymentSystemTypeEnum,
  ): Promise<SubscriptionDocument> {
    const findFilter: {
      stripeSubscriptionId?: string;
      paypalSubscriptionId?: string;
    } = {};

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.STRIPE: {
        findFilter.stripeSubscriptionId = subscriptionId;
        break;
      }

      case PaymentSystemTypeEnum.PAYPAL: {
        findFilter.paypalSubscriptionId = subscriptionId;
        break;
      }
    }

    await this.subscriptionModel.updateOne(findFilter, {
      $set: { endsAt: newEndDate },
    });

    return this.subscriptionModel.findOne(findFilter);
  }

  async findActiveByUserId(
    userId: string,
  ): Promise<SubscriptionDocument | null> {
    const activeSubscriptions: SubscriptionDocument[] =
      await this.subscriptionModel.find({
        userId,
        endsAt: { $gte: new Date() },
      });

    if (activeSubscriptions.length > 1) {
      throw new HttpException('User has multiple active subscriptions', 400);
    }

    if (activeSubscriptions.length === 0) {
      return null;
    }

    return activeSubscriptions[0];
  }

  async findActiveOrTrialByUserId(
    userId: string,
  ): Promise<IActiveTrialSubscriptions> {
    const subscriptions: SubscriptionDocument[] =
      await this.subscriptionModel.find({
        userId,
        $or: [
          { endsAt: { $gte: new Date() } },
          { type: ApiSubscriptionPlanType.TRIAL },
        ],
      });

    return subscriptions.reduce<IActiveTrialSubscriptions>(
      (result, subscription) => {
        if (subscription.type === ApiSubscriptionPlanType.TRIAL) {
          result.trial.push(subscription);
        } else {
          result.active.push(subscription);
        }

        return result;
      },
      { active: [], trial: [] },
    );
  }

  // TODO think about trial service
  async removeTrialSubscription(userId: string) {
    const { deletedCount } = await this.subscriptionModel.deleteOne({
      userId,
      type: ApiSubscriptionPlanType.TRIAL,
    });

    // just in case
    if (deletedCount !== 1) {
      throw new HttpException(
        `The amount of the removed trial subscriptions of the user ${userId} is ${deletedCount}`,
        400,
      );
    }

    await this.userModel.updateOne(
      { _id: userId },
      { requestsExecuted: 0, requestContingents: [] },
    );

    this.eventEmitter.emitAsync(EventType.TRIAL_DATA_REMOVE_EVENT, {
      userId,
    });
  }

  async handleActiveOrTrialSubscriptions(
    subscriptions: IActiveTrialSubscriptions,
  ): Promise<void> {
    if (subscriptions.active.length > 1 || subscriptions.trial.length > 1) {
      throw new HttpException(
        `User has multiple active (${subscriptions.active.length}) or trial (${subscriptions.trial.length}) subscriptions`,
        400,
      );
    }

    if (subscriptions.active.length === 1) {
      throw new HttpException('User already has an active subscription', 400);
    }

    if (subscriptions.trial.length === 1) {
      const trialSubscription = subscriptions.trial[0];
      await this.removeTrialSubscription(trialSubscription.userId);
    }
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionModel.findOne({ stripeSubscriptionId });
  }

  async findByPaypalSubscriptionId(
    paypalSubscriptionId: string,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionModel.findOne({ paypalSubscriptionId });
  }

  async upsertTrialForUser(
    userId: string,
    endsAt: Date,
  ): Promise<SubscriptionDocument> {
    // just in case
    if ((await this.countAllUserSubscriptions(userId)) > 0) {
      throw new HttpException('User already has a subscription', 400);
    }

    return new this.subscriptionModel({
      userId,
      type: ApiSubscriptionPlanType.TRIAL,
      stripePriceId: TRIAL_PRICE_ID,
      endsAt,
    }).save();
  }

  async upsertForUser({
    user: { id: userId, fullname: userName, email: userEmail },
    endsAt,
    type,
    priceId,
    subscriptionId,
    paymentSystemType,
  }: ISubscriptionUpsertData): Promise<SubscriptionDocument> {
    let subscription;

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.STRIPE: {
        subscription = await this.findByStripeSubscriptionId(subscriptionId);
        break;
      }

      case PaymentSystemTypeEnum.PAYPAL: {
        subscription = await this.findByPaypalSubscriptionId(subscriptionId);
        break;
      }
    }

    if (subscription) {
      Object.assign(subscription, {
        stripePriceId: priceId,
        type,
        endsAt,
      });

      this.logger.log(`Update ${type} subscription for ${userId} user`);

      return subscription.save();
    }

    const userSubscriptions = await this.findActiveOrTrialByUserId(userId);
    await this.handleActiveOrTrialSubscriptions(userSubscriptions);

    this.logger.log(`Create ${type} subscription for ${userId} user`);

    const newSubscription: Partial<SubscriptionDocument> = {
      userId,
      type,
      stripePriceId: priceId,
      endsAt,
    };

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.STRIPE: {
        newSubscription.stripeSubscriptionId = subscriptionId;
        break;
      }

      case PaymentSystemTypeEnum.PAYPAL: {
        newSubscription.paypalSubscriptionId = subscriptionId;
        break;
      }
    }

    try {
      await this.mailSenderService.sendMail({
        to: [{ name: userName, email: userEmail }],
        templateId:
          type === ApiSubscriptionPlanType.BUSINESS_PLUS_V2
            ? newUserBusinessPlusSubscriptionTemplateId
            : newUserPayPerUseSubscriptionTemplateId,
        params: {
          href: this.getSubscriptionCancelUrl(paymentSystemType),
        },
      });
    } catch (e) {
      this.logger.error(
        `The subscription letter to ${userEmail} has not been sent due to an error`,
      );
    }

    return new this.subscriptionModel(newSubscription).save();
  }

  getLimitAmount(
    stripePriceId: string,
    limitType: ApiSubscriptionLimitsEnum,
  ): IApiSubscriptionLimitAmount {
    const { plan, price } = this.getApiSubscriptionPlanPrice(stripePriceId);

    return (
      price?.limits?.[limitType]?.amount || plan?.limits?.[limitType]?.amount
    );
  }

  getPaymentItem(priceId: string): IPaymentItem {
    const planPrice = this.getApiSubscriptionPlanPrice(priceId);
    const limitIncreaseParams = this.getLimitIncreaseParams(priceId);
    let paymentItem;

    if (planPrice) {
      paymentItem = {
        type: PaymentItemTypeEnum.SubscriptionPrice,
        item: planPrice.price,
      };
    } else if (limitIncreaseParams) {
      paymentItem = {
        type: PaymentItemTypeEnum.LimitIncrease,
        item: limitIncreaseParams,
      };
    }

    if (!paymentItem) {
      throw new HttpException('Payment item not found!', 400);
    }

    return paymentItem;
  }

  @Cron('0 45 9 * * *')
  async sendSubscriptionExpirationEmail() {
    const dateTimePattern = new RegExp(/(.+)T(.+)Z/);
    const specificIsoDate = dayjs()
      .toISOString()
      .replace(dateTimePattern, `$1T09:45:00.000Z`);
    const currentDate = dayjs(specificIsoDate);

    const subscriptions = await this.subscriptionModel.aggregate([
      {
        $match: {
          endsAt: {
            $gte: currentDate.add(2, 'days').toDate(),
            $lt: currentDate.add(3, 'days').toDate(),
          },
        },
      },
      { $project: { userId: 1 } },
      { $set: { userId: { $toObjectId: '$userId' } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { fullname: 1, email: 1 } }],
        },
      },
      { $project: { user: { $arrayElemAt: ['$user', 0] } } },
    ]);

    const emails = [];
    const sendTo = subscriptions.map(({ user: { fullname: name, email } }) => {
      emails.push(email);

      return { name, email };
    });

    let loggerMessage = 'There are no users with expiring subscriptions.';

    if (sendTo.length > 0) {
      await Promise.all(
        sendTo.map((to) =>
          this.mailSenderService.sendMail({
            to: [to],
            templateId: subscriptionRenewalTemplateId,
            params: {
              href: this.getSubscriptionCancelUrl(),
            },
          }),
        ),
      );

      loggerMessage = `The emails have been sent to ${emails.join(', ')}.`;
    }

    this.logger.log(loggerMessage);
  }
}

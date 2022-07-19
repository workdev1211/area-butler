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
import { allSubscriptions } from '../../../shared/constants/subscription-plan';
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
import { UserDocument } from './schema/user.schema';

@Injectable()
export class SubscriptionService {
  private readonly logger: Logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly mailSenderService: MailSenderService,
  ) {}

  private getSubscriptionCancelUrl(
    paymentSystemType?: PaymentSystemTypeEnum,
  ): string {
    let subscriptionCancelUrl = `${configService.getBaseAppUrl()}/profile`;

    if (paymentSystemType === PaymentSystemTypeEnum.PayPal) {
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

  async fetchAllUserSubscriptions(
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
      case PaymentSystemTypeEnum.Stripe: {
        findFilter.stripeSubscriptionId = subscriptionId;
        break;
      }

      case PaymentSystemTypeEnum.PayPal: {
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
    const userSubscriptions: SubscriptionDocument[] =
      await this.fetchAllUserSubscriptions(userId);

    const activeSubscriptions = userSubscriptions.filter(
      (s) => s.endsAt >= new Date(),
    );

    if (activeSubscriptions.length > 1) {
      throw new HttpException('User has multiple active subscriptions', 400);
    }

    if (activeSubscriptions.length < 1) {
      return null;
    }

    return activeSubscriptions[0];
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

  async upsertByUserId(
    { _id: userId, fullname: userName, email: userEmail }: UserDocument,
    type: ApiSubscriptionPlanType,
    subscriptionId = 'unverified-new',
    priceId: string,
    endsAt: Date,
    paymentSystemType: PaymentSystemTypeEnum,
  ): Promise<SubscriptionDocument> {
    let subscription;

    switch (paymentSystemType) {
      case PaymentSystemTypeEnum.Stripe: {
        subscription = await this.findByStripeSubscriptionId(subscriptionId);
        break;
      }

      case PaymentSystemTypeEnum.PayPal: {
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
    } else {
      if (await this.findActiveByUserId(userId)) {
        throw new HttpException('user has already an active subscription', 400);
      }

      this.logger.log(`Create ${type} subscription for ${userId} user`);

      const newSubscription: Partial<SubscriptionDocument> = {
        userId,
        type,
        stripePriceId: priceId,
        endsAt,
      };

      switch (paymentSystemType) {
        case PaymentSystemTypeEnum.Stripe: {
          newSubscription.stripeSubscriptionId = subscriptionId;
          break;
        }

        case PaymentSystemTypeEnum.PayPal: {
          newSubscription.paypalSubscriptionId = subscriptionId;
          break;
        }
      }

      await this.mailSenderService.batchSendMail({
        to: [{ name: userName, email: userEmail }],
        templateId:
          type === ApiSubscriptionPlanType.BUSINESS_PLUS_V2
            ? newUserBusinessPlusSubscriptionTemplateId
            : newUserPayPerUseSubscriptionTemplateId,
        params: {
          href: this.getSubscriptionCancelUrl(paymentSystemType),
        },
      });

      return new this.subscriptionModel(newSubscription).save();
    }
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

    await this.mailSenderService.batchSendMail({
      to: sendTo,
      templateId: subscriptionRenewalTemplateId,
      params: {
        href: this.getSubscriptionCancelUrl(),
      },
    });

    this.logger.log(
      `The emails have been sent to ${emails.join(
        ', ',
      )} on ${currentDate.toISOString()}`,
    );
  }
}

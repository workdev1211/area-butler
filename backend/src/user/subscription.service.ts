import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

@Injectable()
export class SubscriptionService {
  private readonly logger: Logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

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
    userId: string,
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
}

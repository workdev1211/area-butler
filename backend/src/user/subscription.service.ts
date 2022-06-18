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
} from '@area-butler-types/subscription-plan';
import ApiSubscriptionPricingDto from '../dto/api-subscription-pricing.dto';

@Injectable()
export class SubscriptionService {
  private logger: Logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  getApiSubscriptionPlanPrice(
    stripePriceId: string,
  ):
    | { plan: ApiSubscriptionPlanDto; price: ApiSubscriptionPricingDto }
    | undefined {
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

  getLimitIncreaseParams(itemPriceId: string): {
    type: ApiSubscriptionLimitsEnum;
    amount: IApiSubscriptionLimitAmount;
  } {
    const stripeEnv = configService.getStripeEnv();

    let foundItem;

    Object.values(allSubscriptions).some(({ limits: planLimits, prices }) => {
      const hasPriceLimitIncreaseItem = prices.some(
        ({ limits: priceLimits }) =>
          priceLimits &&
          Object.keys(priceLimits).some((limitType) => {
            if (
              priceLimits[limitType].increaseParams?.id[stripeEnv] ===
              itemPriceId
            ) {
              foundItem = priceLimits[limitType].increaseParams;

              return true;
            }

            return false;
          }),
      );

      if (hasPriceLimitIncreaseItem) {
        return true;
      }

      // hasPlanLimitIncreaseItem
      return (
        planLimits &&
        Object.keys(planLimits).some((limitType) => {
          if (
            planLimits[limitType].increaseParams?.id[stripeEnv] === itemPriceId
          ) {
            foundItem = planLimits[limitType].increaseParams;

            return true;
          }

          return false;
        })
      );
    });

    return foundItem;
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

  async renewSubscription(
    stripeSubscriptionId: string,
    newEndDate: Date,
  ): Promise<SubscriptionDocument> {
    await this.subscriptionModel.updateOne(
      { stripeSubscriptionId },
      { $set: { endsAt: newEndDate } },
    );

    return this.subscriptionModel.findOne({ stripeSubscriptionId });
  }

  async findActiveByUserId(
    userId: string,
  ): Promise<SubscriptionDocument | null> {
    const userSubscriptions: SubscriptionDocument[] =
      await this.fetchAllUserSubscriptions(userId);

    const activeSubscriptions = userSubscriptions.filter(
      (s) =>
        s.trialEndsAt >= new Date() ||
        (s.trialEndsAt < new Date() && s.endsAt >= new Date()),
    );

    if (activeSubscriptions.length > 1) {
      throw new HttpException('user has multliple active subscriptions', 400);
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

  async upsertByUserId(
    userId: string,
    type: ApiSubscriptionPlanType,
    stripeSubscriptionId = 'unverified-new',
    stripePriceId: string,
    endsAt: Date,
    trialEndsAt: Date,
  ): Promise<SubscriptionDocument> {
    if (type === 'TRIAL') {
      if (await this.findActiveByUserId(userId)) {
        throw new HttpException('User already has an active subscription', 400);
      }

      return new this.subscriptionModel({
        userId,
        type,
        stripePriceId,
        endsAt,
        trialEndsAt,
        stripeSubscriptionId,
      }).save();
    }

    const subscription = await this.findByStripeSubscriptionId(
      stripeSubscriptionId,
    );

    if (subscription) {
      Object.assign(subscription, {
        stripePriceId,
        type,
        endsAt,
        trialEndsAt,
      });

      this.logger.log(`Update ${type} subscription for ${userId} user`);

      return subscription.save();
    } else {
      if (await this.findActiveByUserId(userId)) {
        throw new HttpException('user has already an active subscription', 400);
      }

      this.logger.log(`Create ${type} subscription for ${userId} user`);

      return new this.subscriptionModel({
        userId,
        type,
        stripePriceId,
        endsAt,
        trialEndsAt,
        stripeSubscriptionId,
      }).save();
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
}

import {HttpException, Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Subscription, SubscriptionDocument} from "./schema/subscription.schema";
import {ApiSubscriptionPlan, ApiSubscriptionPlanType} from "@area-butler-types/subscription-plan";
import {configService} from "../config/config.service";
import {allSubscriptions} from "../../../shared/constants/subscription-plan";

@Injectable()
export class SubscriptionService {

    private logger: Logger = new Logger(SubscriptionService.name);

    constructor(
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
    ) {
    }

    public getApiSubscriptionPlanForStripePriceId(stripePriceId: string): ApiSubscriptionPlan | undefined {
        const stripeEnv = configService.getStripeEnv();
        return Object.values(allSubscriptions).find(
            (subscription: ApiSubscriptionPlan) =>
                subscription.priceIds[stripeEnv].annuallyId === stripePriceId ||
                subscription.priceIds[stripeEnv].monthlyId === stripePriceId);
    }

    public async checkSubscriptionViolation(
        userId: string,
        check: (subscription: ApiSubscriptionPlan) => boolean,
        message: string,
    ): Promise<void> {
        const userSubscription = await this.findActiveByUserId(userId);

        if (!userSubscription) {
            throw new HttpException('User has no active subscription', 400);
        }


        if (check(allSubscriptions[userSubscription.type])) {
            throw new HttpException(message, 400);
        }
    };

    public async allUserSubscriptions(userId: string): Promise<SubscriptionDocument[]> {
        return this.subscriptionModel.find({userId});
    }

    public async renewSubscription(stripeSubscriptionId: string, newEndDate: Date): Promise<SubscriptionDocument> {
        await this.subscriptionModel.updateOne({stripeSubscriptionId}, {$set: {endsAt: newEndDate}});
        return this.subscriptionModel.findOne({stripeSubscriptionId});
    }

    public async findActiveByUserId(userId: string): Promise<SubscriptionDocument | null> {
        const userSubscriptions: SubscriptionDocument[] = await this.allUserSubscriptions(userId)
        const activeSubscriptions = userSubscriptions.filter(s => s.trialEndsAt >= new Date() || (s.trialEndsAt < new Date() && s.endsAt >= new Date()));
        if (activeSubscriptions.length > 1) {
            throw new HttpException("user has multliple active subscriptions", 400);
        }
        if (activeSubscriptions.length < 1) {
            return null;
        }
        return activeSubscriptions[0];
    }

    public async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionDocument> {
        return this.subscriptionModel.findOne({stripeSubscriptionId});
    }

    public async upsertForUserId(userId: string, type: ApiSubscriptionPlanType, stripeSubscriptionId = 'unverified-new', stripePriceId: string, endsAt: Date, trialEndsAt: Date): Promise<SubscriptionDocument> {

        if (type === ApiSubscriptionPlanType.TRIAL) {
            if (await this.findActiveByUserId(userId)) {
                throw new HttpException("user has already an active subscription", 400);
            }

            return await new this.subscriptionModel({
                userId,
                type,
                stripePriceId,
                endsAt,
                trialEndsAt,
                stripeSubscriptionId
            }).save();
        }

        const subscription = await this.findByStripeSubscriptionId(stripeSubscriptionId);

        if (!!subscription) {
            subscription.stripePriceId = stripePriceId;
            subscription.type = type;
            subscription.endsAt = endsAt;
            subscription.trialEndsAt = trialEndsAt;
            this.logger.log(`Create subscription for ${userId}, ${type}`);
            return await subscription.save();
        } else {
            if (await this.findActiveByUserId(userId)) {
                throw new HttpException("user has already an active subscription", 400);
            }

            return await new this.subscriptionModel({
                userId,
                type,
                stripePriceId,
                endsAt,
                trialEndsAt,
                stripeSubscriptionId
            }).save();
        }


    }

}

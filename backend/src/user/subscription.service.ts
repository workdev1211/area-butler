import {HttpException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Subscription, SubscriptionDocument} from "./schema/subscription.schema";
import {ApiSubscriptionPlanType} from "@area-butler-types/subscription-plan";

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
    ) {
    }

    public async findActiveByUserId(userId: string): Promise<SubscriptionDocument | null> {
        const userSubscriptions: SubscriptionDocument[] = await this.subscriptionModel.find({userId});
        const activeSubscriptions = userSubscriptions.filter(s => s.endsAt >= new Date());
        if (activeSubscriptions.length > 1) {
            throw new HttpException("user has multliple active subscriptions", 400);
        }
        if (activeSubscriptions.length < 1) {
            return null;
        }
        return activeSubscriptions[0];
    }

    public async createForUserId(userId: string, type: ApiSubscriptionPlanType, stripePriceId: string, endsAt: Date, trialEndsAt: Date): Promise<SubscriptionDocument> {
        if (await this.findActiveByUserId(userId)) {
            throw new HttpException("user has already an active subscription", 400);
        }
        return await new this.subscriptionModel({
            userId,
            type,
            stripePriceId,
            endsAt,
            trialEndsAt,
            stripeSubscriptionId: 'unverified-new'
        }).save();
    }

}

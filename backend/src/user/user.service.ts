import {
  ApiRequestContingentType,
  ApiSubscriptionPlan,
} from '@area-butler-types/subscription-plan';
import { ApiConsent, ApiTour, ApiUpsertUser } from '@area-butler-types/types';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model, Types } from 'mongoose';
import { EventType, UserCreatedEvent } from 'src/event/event.types';
import { allSubscriptions } from '../../../shared/constants/subscription-plan';
import { User, UserDocument } from './schema/user.schema';
import { configService } from '../config/config.service';
import { SubscriptionService } from './subscription.service';
import { InviteCodeService } from './invite-code.service';

@Injectable()
export class UserService {
  inviteCodeNeeded = true;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private subscriptionService: SubscriptionService,
    private inviteCodeService: InviteCodeService,
    private eventEmitter: EventEmitter2,
  ) {
    this.inviteCodeNeeded = configService.IsInviteCodeNeeded();
  }

  public async upsertUser(
    email: string,
    fullname: string,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email });
    if (!!existingUser) {
      return existingUser;
    } else {
      const newUser = await new this.userModel({
        email,
        fullname,
        consentGiven: null,
      }).save();
      const event: UserCreatedEvent = {
        user: newUser,
      };

      this.eventEmitter.emitAsync(EventType.USER_CREATED_EVENT, event);

      return newUser;
    }
  }

  public async patchUser(email: string, { fullname }: ApiUpsertUser) {
    const existingUser = await this.userModel.findOne({ email });

    if (!existingUser) {
      throw new HttpException('Unknown User', 400);
    }

    Object.assign(existingUser, { fullname });

    return existingUser.save();
  }

  public async giveConsent(email: string, apiConsent: ApiConsent) {
    const existingUser = await this.upsertUser(email, email);

    if (!existingUser) {
      throw new HttpException('Unknown User', 400);
    }

    if (!!this.inviteCodeNeeded) {
      await this.inviteCodeService.consumeInviteCode(existingUser._id, apiConsent.inviteCode);
    }

    if (!existingUser.consentGiven) {
      existingUser.consentGiven = new Date();
    }

    return existingUser.save();
  }

  public async hideTour(email: string, tour?: ApiTour) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new HttpException('Unknown User', 400);
    }

    const showTour = {...user.showTour};

    if (!!tour) {
      showTour[tour] = false;
    } else {
      Object.keys(user.showTour).forEach(tour => showTour[tour] = false);
    }
    user.showTour = showTour;
    return await user.save();
  }

  public async setStripeCustomerId(
    user: UserDocument,
    stripeCustomerId: string,
  ): Promise<UserDocument> {
    const oid = new Types.ObjectId(user.id);
    await this.userModel.updateOne(
      { _id: oid },
      { $set: { stripeCustomerId } },
    );
    return this.findById(user.id);
  }

  public async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<UserDocument> {
    return this.userModel.findOne({ stripeCustomerId });
  }

  public async findById(id: string): Promise<UserDocument> {
    const oid = new Types.ObjectId(id);
    return this.userModel.findById({ _id: oid });
  }

  public async incrementExecutedRequestCount(id: string): Promise<void> {
    const oid = new Types.ObjectId(id);
    await this.userModel.updateOne(
      { _id: oid },
      { $inc: { requestsExecuted: 1 } },
    );
  }

  public async changeSubscriptionPlan(
    stripeCustomerId: string,
    stripePriceId: string,
  ): Promise<UserDocument> {
    const user = await this.findByStripeCustomerId(stripeCustomerId);

    if (!user) {
      console.log('no user found for stripeId: ' + stripeCustomerId);
      return;
    }

    const subscriptionPlan = this.subscriptionService.getApiSubscriptionPlanForStripePriceId(
      stripePriceId,
    );

    if (!subscriptionPlan) {
      console.log('no subscription plan found for price id: ' + stripePriceId);
      return;
    }

    const oid = new Types.ObjectId(user.id);
    await this.userModel.updateOne(
      { _id: oid },
      { $set: { subscriptionPlan: subscriptionPlan.type } },
    );
    const userWithSubscription = await this.findById(user.id);
    return await this.addMonthlyRequestContingents(
      userWithSubscription,
      new Date(),
    );
  }

  public async addRequestContingentIncrease(
    user: UserDocument,
    amount: number,
  ): Promise<UserDocument> {
    user.requestContingents.push({
      type: ApiRequestContingentType.INCREASE,
      amount,
      date: new Date(),
    });
    const oid = new Types.ObjectId(user.id);
    await this.userModel.updateOne(
      { _id: oid },
      { $set: { requestContingents: user.requestContingents } },
    );
    return Promise.resolve(user);
  }

  public async addMonthlyRequestContingents(
    user: UserDocument,
    untilMonthIncluded: Date,
  ): Promise<UserDocument> {
    const userSubscription = await this.subscriptionService.findActiveByUserId(
      user._id,
    );

    if (!userSubscription) {
      return Promise.resolve(user);
    }

    const subscription = allSubscriptions[userSubscription.type];
    let currentMonth = new Date();

    while (
      currentMonth.getFullYear() < untilMonthIncluded.getFullYear() ||
      (currentMonth.getFullYear() === untilMonthIncluded.getFullYear() &&
        currentMonth.getMonth() <= untilMonthIncluded.getMonth())
    ) {
      const existingMonthlyContingent = user.requestContingents.find(
        c =>
          c.type === ApiRequestContingentType.RECURRENT &&
          c.date.getMonth() === currentMonth.getMonth() &&
          c.date.getFullYear() === currentMonth.getFullYear(),
      );

      if (!existingMonthlyContingent) {
        user.requestContingents.push({
          type: ApiRequestContingentType.RECURRENT,
          amount: subscription?.limits?.numberOfRequestsPerMonth,
          date: currentMonth,
        });
      } else {
        existingMonthlyContingent.amount =
          subscription?.limits?.numberOfRequestsPerMonth;
      }
      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();
      currentMonth = new Date();
      currentMonth.setFullYear(year);
      currentMonth.setMonth(month + 1);
    }

    const oid = new Types.ObjectId(user.id);
    await this.userModel.updateOne(
      { _id: oid },
      { $set: { requestContingents: user.requestContingents } },
    );
    return Promise.resolve(user);
  }
}

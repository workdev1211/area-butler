import {
  ApiRequestContingent,
  ApiRequestContingentType,
} from '@area-butler-types/subscription-plan';
import { ApiUpsertUser } from '@area-butler-types/types';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model, Types } from 'mongoose';
import { EventType, UserCreatedEvent } from 'src/event/event.types';
import { allSubscriptions } from '../../../shared/constants/subscription-plan';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

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

  public async patchUser(email: string, upsertUser: ApiUpsertUser) {
    const existingUser = await this.userModel.findOne({ email });

    if (!existingUser) {
      throw new HttpException('Unknown User', 400);
    }

    Object.assign(existingUser, upsertUser);

    return existingUser.save();
  }

  public async giveConsent(email: string) {
    const existingUser = await this.userModel.findOne({ email });

    if (!existingUser) {
      throw new HttpException('Unknown User', 400);
    }

    if (!existingUser.consentGiven) {
      existingUser.consentGiven = new Date();
    }

    return existingUser.save();
  }

  public async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
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
    await this.userModel.updateOne({_id: oid}, {$set: {requestContingents: user.requestContingents}});
    return Promise.resolve(user);
  }

  public async addMonthlyRequestContingentIfMissing(
    user: UserDocument,
    date: Date,
  ): Promise<UserDocument> {
    if (!user.subscriptionPlan) {
      return Promise.resolve(user);
    }

    const existingMonthlyContingent = user.requestContingents.find(
      c =>
        c.date.getMonth() === date.getMonth() &&
        c.date.getFullYear() === date.getFullYear(),
    );

    if (!!existingMonthlyContingent) {
      return Promise.resolve(user);
    }

    const subscription = allSubscriptions[user.subscriptionPlan];
    user.requestContingents.push({
      ...subscription.limits.monthlyRequestContingent,
      date,
    });
    const oid = new Types.ObjectId(user.id);
    await this.userModel.updateOne({_id: oid}, {$set: {requestContingents: user.requestContingents}});
    return Promise.resolve(user);
  }
}

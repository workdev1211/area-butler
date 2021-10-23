import { ApiUpsertUser } from '@area-butler-types/types';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model, Types } from 'mongoose';
import { EventType, UserCreatedEvent } from 'src/event/event.types';
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
        consentGiven: false,
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

  public async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  public async findById(id: string): Promise<UserDocument> {
    const oid = new Types.ObjectId(id);
    return this.userModel.findById({ _id: oid });
  }
}

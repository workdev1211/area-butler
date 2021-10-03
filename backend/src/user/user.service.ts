import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from 'eventemitter2';
import { Model } from 'mongoose';
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
      await existingUser.updateOne({ fullname });
      return existingUser;
    } else {
      const newUser = await new this.userModel({ email, fullname }).save();
      const event: UserCreatedEvent = {
        user: newUser,
      };

      this.eventEmitter.emitAsync(EventType.USER_CREATED_EVENT, event);

      return newUser;
    }
  }

  public async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }
}

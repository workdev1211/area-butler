import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async upsertUser(
    email: string,
    fullname: string,
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email });
    if (!!existingUser) {
      await existingUser.updateOne({ fullname });
      return existingUser;
    } else {
      return await new this.userModel({ email, fullname }).save();
    }
  }

  public async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }
}

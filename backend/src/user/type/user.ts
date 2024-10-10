import { Request } from 'express';

import { UserDocument } from '../schema/user.schema';

export interface IUserRequest extends Request {
  principal: UserDocument;
  user: { email: string };
}

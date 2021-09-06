import { ApiUser } from '@area-butler-types/types';
import { UserDocument } from '../schema/user.schema';

export const mapUserToApiUser = (user: UserDocument): ApiUser => ({
  fullname: user.fullname,
  email: user.email,
});

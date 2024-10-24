import { UserDocument } from '../../user/schema/user.schema';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';

export type TUnitedUser = UserDocument | TIntegrationUserDocument;

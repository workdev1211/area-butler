import { IsDate, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IIntUserSubscription } from '@area-butler-types/integration-user';

@Exclude()
class ApiIntUserSubscriptionDto implements IIntUserSubscription {
  @Expose()
  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;
}

export default ApiIntUserSubscriptionDto;

import { IsNotEmpty, IsString } from 'class-validator';

import { IApiApprovePaypalSubscription } from '@area-butler-types/types';

class ApiApprovePaypalSubscriptionDto implements IApiApprovePaypalSubscription {
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;
}

export default ApiApprovePaypalSubscriptionDto;

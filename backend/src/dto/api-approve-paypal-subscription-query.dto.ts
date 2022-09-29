import { IsNotEmpty, IsString } from 'class-validator';

import { IApiApprovePaypalSubscriptionQuery } from '@area-butler-types/types';

class ApiApprovePaypalSubscriptionQueryDto
  implements IApiApprovePaypalSubscriptionQuery
{
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;
}

export default ApiApprovePaypalSubscriptionQueryDto;

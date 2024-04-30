import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  IApiUnlockIntProductReq,
  IntegrationActionTypeEnum,
} from '@area-butler-types/integration';

@Exclude()
class ApiUnlockIntProductReqDto implements IApiUnlockIntProductReq {
  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(IntegrationActionTypeEnum))
  actionType: IntegrationActionTypeEnum;
}

export default ApiUnlockIntProductReqDto;

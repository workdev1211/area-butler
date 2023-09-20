import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeActivationReq } from '@area-butler-types/on-office';

class ApiOnOfficeActivationReqDto implements IApiOnOfficeActivationReq {
  @IsNotEmpty()
  @IsString()
  apiClaim: string;

  @IsNotEmpty()
  @IsString()
  apiToken: string;

  @IsNotEmpty()
  @IsString()
  customerWebId: string;

  @IsNotEmpty()
  @IsString()
  parameterCacheId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export default ApiOnOfficeActivationReqDto;

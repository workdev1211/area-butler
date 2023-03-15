import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeUnlockProviderReq } from '@area-butler-types/on-office';

class ApiOnOfficeUnlockProviderReqDto implements IApiOnOfficeUnlockProviderReq {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  secret: string;

  @IsNotEmpty()
  @IsString()
  parameterCacheId: string;

  @IsNotEmpty()
  @IsString()
  extendedClaim: string;
}

export default ApiOnOfficeUnlockProviderReqDto;

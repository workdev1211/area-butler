import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeUnlockProvider } from '@area-butler-types/on-office';

class ApiOnOfficeUnlockProviderDto implements IApiOnOfficeUnlockProvider {
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

export default ApiOnOfficeUnlockProviderDto;

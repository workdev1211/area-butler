import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOnOfficeLoginReq } from '@area-butler-types/on-office';

class ApiOnOfficeLoginReqDto implements IApiOnOfficeLoginReq {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  apiClaim: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  customerWebId: string;

  @IsNotEmpty()
  @IsString()
  parameterCacheId: string;

  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  estateId: string;

  @IsNotEmpty()
  @IsString()
  signature: string;
}

export default ApiOnOfficeLoginReqDto;

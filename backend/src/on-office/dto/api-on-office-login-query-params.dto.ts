import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IApiOnOfficeLoginQueryParams } from '@area-butler-types/on-office';

class ApiOnOfficeLoginQueryParamsDto implements IApiOnOfficeLoginQueryParams {
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

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  imageIds?: string;
}

export default ApiOnOfficeLoginQueryParamsDto;

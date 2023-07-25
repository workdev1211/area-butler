import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeConfirmOrderQueryParams,
} from '@area-butler-types/on-office';

class ApiOnOfficeConfirmOrderQueryParamsDto
  implements IApiOnOfficeConfirmOrderQueryParams
{
  @IsOptional()
  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @IsEnum(ApiOnOfficeTransactionStatusesEnum)
  status: ApiOnOfficeTransactionStatusesEnum;

  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  errorCodes?: string;

  @IsOptional()
  @IsString()
  transactionid?: string;

  @IsOptional()
  @IsString()
  referenceid?: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @IsNotEmpty()
  @IsString()
  products: string;
}

export default ApiOnOfficeConfirmOrderQueryParamsDto;

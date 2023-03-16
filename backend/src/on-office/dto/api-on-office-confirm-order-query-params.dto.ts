import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeConfirmOrderQueryParams,
} from '@area-butler-types/on-office';

class ApiOnOfficeConfirmOrderQueryParamsDto
  implements IApiOnOfficeConfirmOrderQueryParams
{
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @IsString()
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
}

export default ApiOnOfficeConfirmOrderQueryParamsDto;

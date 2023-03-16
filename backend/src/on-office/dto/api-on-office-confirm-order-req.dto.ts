import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
  ApiOnOfficeTransactionStatusesEnum,
  IApiOnOfficeConfirmOrderReq,
} from '@area-butler-types/on-office';

class ApiOnOfficeConfirmOrderReqDto implements IApiOnOfficeConfirmOrderReq {
  @IsOptional()
  @IsString()
  errorCodes?: string;

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
  transactionid?: string;

  @IsOptional()
  @IsString()
  referenceid?: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  extendedClaim: string;
}

export default ApiOnOfficeConfirmOrderReqDto;

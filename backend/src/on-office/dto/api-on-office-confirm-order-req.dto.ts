import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IApiOnOfficeConfirmOrderReq } from '@area-butler-types/on-office';

class ApiOnOfficeConfirmOrderReqDto implements IApiOnOfficeConfirmOrderReq {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsString()
  referenceid: string;

  @IsNotEmpty()
  @IsString()
  transactionid: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['success'])
  status: 'success';
}

export default ApiOnOfficeConfirmOrderReqDto;

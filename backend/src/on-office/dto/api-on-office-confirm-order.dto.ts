import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IApiOnOfficeConfirmOrder } from '@area-butler-types/on-office';

class ApiOnOfficeConfirmOrderDto implements IApiOnOfficeConfirmOrder {
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

export default ApiOnOfficeConfirmOrderDto;

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IApiCapturePaypalPayment } from '@area-butler-types/types';
import { ILimitIncreaseMetadata } from '@area-butler-types/billing';
import ApiLimitIncreaseMetadataDto from './api-limit-increase-metadata.dto';

class ApiCapturePaypalPaymentDto implements IApiCapturePaypalPayment {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiLimitIncreaseMetadataDto)
  metadata?: ILimitIncreaseMetadata;
}

export default ApiCapturePaypalPaymentDto;

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { MeansOfTransportation } from '@area-butler-types/types';
import { IApiOpenAiLocDescQuery } from '@area-butler-types/open-ai';
import ApiOpenAiGeneralQueryDto from './api-open-ai-general-query.dto';

@Exclude()
class ApiOpenAiLocDescQueryDto
  extends ApiOpenAiGeneralQueryDto
  implements IApiOpenAiLocDescQuery
{
  @Expose()
  @IsOptional()
  @IsNumber()
  maxCharactersLength?: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  snapshotId: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(MeansOfTransportation)
  meanOfTransportation: MeansOfTransportation;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isForOnePage?: boolean;
}

export default ApiOpenAiLocDescQueryDto;

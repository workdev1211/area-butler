import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiOpenAiResponseLimit,
  IOpenAiGeneralFormValues,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';
import ApiOpenAiResponseLimitDto from '../../open-ai/dto/api-open-ai-response-limit.dto';
import {
  maxCharacterNumber,
  minCharacterNumber,
} from '../../../../shared/constants/open-ai';

class ApiOpenAiGeneralQueryDto implements IOpenAiGeneralFormValues {
  @IsOptional()
  @IsEnum(OpenAiTonalityEnum)
  tonality?: OpenAiTonalityEnum;

  @IsOptional()
  @IsString()
  targetGroupName?: string;

  @IsOptional()
  @IsString()
  customText?: string;

  @IsOptional()
  @IsInt()
  @Min(minCharacterNumber)
  @Max(maxCharacterNumber)
  characterLimit?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOpenAiResponseLimitDto)
  responseLimit?: IApiOpenAiResponseLimit;
}

export default ApiOpenAiGeneralQueryDto;

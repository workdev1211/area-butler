import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  IOpenAiGeneralFormValues,
  OpenAiTextLengthEnum,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';

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
  @IsEnum(OpenAiTextLengthEnum)
  textLength?: OpenAiTextLengthEnum;
}

export default ApiOpenAiGeneralQueryDto;

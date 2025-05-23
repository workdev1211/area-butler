import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  IOpenAiGeneralFormValues,
  OpenAiTextLengthEnum,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';
import { Exclude, Expose } from 'class-transformer';
import { LanguageTypeEnum } from '@area-butler-types/types';

@Exclude()
class ApiOpenAiGeneralQueryDto implements IOpenAiGeneralFormValues {
  @Expose()
  @IsOptional()
  @IsEnum(OpenAiTonalityEnum)
  tonality?: OpenAiTonalityEnum;

  @Expose()
  @IsOptional()
  @IsString()
  targetGroupName?: string;

  @Expose()
  @IsOptional()
  @IsString()
  customText?: string;

  @Expose()
  @IsOptional()
  @IsEnum(OpenAiTextLengthEnum)
  textLength?: OpenAiTextLengthEnum;

  @Expose()
  @IsOptional()
  @IsEnum(LanguageTypeEnum)
  language?: LanguageTypeEnum;
}

export default ApiOpenAiGeneralQueryDto;

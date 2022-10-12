import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { MeansOfTransportation } from '@area-butler-types/types';
import {
  IApiAiDescriptionQuery,
  OpenAiTextLengthEnum,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';

class ApiAiDescriptionQueryDto implements IApiAiDescriptionQuery {
  @IsNotEmpty()
  @IsString()
  searchResultSnapshotId: string;

  @IsNotEmpty()
  @IsEnum(MeansOfTransportation)
  meanOfTransportation: MeansOfTransportation;

  @IsNotEmpty()
  @IsEnum(OpenAiTonalityEnum)
  tonality: OpenAiTonalityEnum;

  @IsNotEmpty()
  @IsEnum(OpenAiTextLengthEnum)
  textLength: OpenAiTextLengthEnum;

  @IsOptional()
  @IsString()
  customText?: string;
}

export default ApiAiDescriptionQueryDto;

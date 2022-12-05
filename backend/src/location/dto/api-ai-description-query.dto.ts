import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { MeansOfTransportation } from '@area-butler-types/types';
import {
  IApiAiDescriptionQuery,
  // TODO remove in future
  // OpenAiTextLengthEnum,
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

  // TODO remove in future
  // @IsNotEmpty()
  // @IsEnum(OpenAiTextLengthEnum)
  // textLength: OpenAiTextLengthEnum;

  @IsOptional()
  @IsString()
  customText?: string;
}

export default ApiAiDescriptionQueryDto;

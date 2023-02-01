import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { MeansOfTransportation } from '@area-butler-types/types';
import {
  IApiOpenAiLocationDescriptionQuery,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';

class ApiOpenAiLocationDescriptionQueryDto implements IApiOpenAiLocationDescriptionQuery {
  @IsNotEmpty()
  @IsString()
  searchResultSnapshotId: string;

  @IsNotEmpty()
  @IsEnum(MeansOfTransportation)
  meanOfTransportation: MeansOfTransportation;

  @IsNotEmpty()
  @IsEnum(OpenAiTonalityEnum)
  tonality: OpenAiTonalityEnum;

  @IsOptional()
  @IsString()
  customText?: string;
}

export default ApiOpenAiLocationDescriptionQueryDto;

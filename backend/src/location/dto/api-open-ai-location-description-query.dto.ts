import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ISelectTextValue,
  MeansOfTransportation,
} from '@area-butler-types/types';
import {
  IApiOpenAiLocationDescriptionQuery,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';
import ApiSelectTextValueDto from '../../dto/api-select-text-value.dto';

class ApiOpenAiLocationDescriptionQueryDto
  implements IApiOpenAiLocationDescriptionQuery
{
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
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSelectTextValueDto)
  customText?: ISelectTextValue;
}

export default ApiOpenAiLocationDescriptionQueryDto;

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
  IApiOpenAiResponseLimit,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';
import ApiOpenAiResponseLimitDto from '../../open-ai/dto/api-open-ai-response-limit.dto';
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

  @IsOptional()
  @IsEnum(OpenAiTonalityEnum)
  tonality?: OpenAiTonalityEnum;

  @IsOptional()
  @IsString()
  targetGroupName?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSelectTextValueDto)
  customText?: ISelectTextValue;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOpenAiResponseLimitDto)
  responseLimit?: IApiOpenAiResponseLimit;

  // in case of the integration
  @IsOptional()
  @IsString()
  realEstateListingId?: string;
}

export default ApiOpenAiLocationDescriptionQueryDto;

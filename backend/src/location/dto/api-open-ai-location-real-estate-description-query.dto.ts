import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { MeansOfTransportation } from '@area-butler-types/types';
import {
  IApiOpenAiLocationRealEstateDescriptionQuery,
  OpenAiTonalityEnum,
} from '@area-butler-types/open-ai';

class ApiOpenAiLocationRealEstateDescriptionQueryDto
  implements IApiOpenAiLocationRealEstateDescriptionQuery
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
  @IsString()
  customText?: string;

  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;
}

export default ApiOpenAiLocationRealEstateDescriptionQueryDto;

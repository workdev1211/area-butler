import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  IApiOpenAiRealEstateDescriptionQuery,
  IApiOpenAiResponseLimit,
} from '@area-butler-types/open-ai';
import ApiOpenAiResponseLimitDto from '../../open-ai/dto/api-open-ai-response-limit.dto';

class ApiOpenAiRealEstateDescriptionQueryDto
  implements IApiOpenAiRealEstateDescriptionQuery
{
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiOpenAiResponseLimitDto)
  responseLimit?: IApiOpenAiResponseLimit;
}

export default ApiOpenAiRealEstateDescriptionQueryDto;

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiOpenAiRealEstDescQuery } from '@area-butler-types/open-ai';
import ApiOpenAiGeneralQueryDto from './api-open-ai-general-query.dto';
import { LanguageTypeEnum } from '@area-butler-types/types';

@Exclude()
class ApiOpenAiRealEstDescQueryDto
  extends ApiOpenAiGeneralQueryDto
  implements IApiOpenAiRealEstDescQuery
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  realEstateId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  realEstateType: string;

  @Expose()
  @IsOptional()
  @IsEnum(LanguageTypeEnum)
  language: LanguageTypeEnum;
}

export default ApiOpenAiRealEstDescQueryDto;

import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiOpenAiRealEstDescQuery } from '@area-butler-types/open-ai';
import ApiOpenAiGeneralQueryDto from './api-open-ai-general-query.dto';

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
}

export default ApiOpenAiRealEstDescQueryDto;

import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import ApiOpenAiLocDescQueryDto from './api-open-ai-loc-desc-query.dto';
import { IApiOpenAiLocRealEstDescQuery } from '@area-butler-types/open-ai';

@Exclude()
class ApiOpenAiLocRealEstDescQueryDto
  extends ApiOpenAiLocDescQueryDto
  implements IApiOpenAiLocRealEstDescQuery
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

export default ApiOpenAiLocRealEstDescQueryDto;

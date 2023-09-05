import { IsNotEmpty, IsString } from 'class-validator';

import ApiOpenAiLocDescQueryDto from './api-open-ai-loc-desc-query.dto';
import { IApiOpenAiLocRealEstDescQuery } from '@area-butler-types/open-ai';

class ApiOpenAiLocRealEstDescQueryDto
  extends ApiOpenAiLocDescQueryDto
  implements IApiOpenAiLocRealEstDescQuery
{
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;
}

export default ApiOpenAiLocRealEstDescQueryDto;

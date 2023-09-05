import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOpenAiRealEstDescQuery } from '@area-butler-types/open-ai';
import ApiOpenAiGeneralQueryDto from '../../location/dto/api-open-ai-general-query.dto';

class ApiOpenAiRealEstDescQueryDto
  extends ApiOpenAiGeneralQueryDto
  implements IApiOpenAiRealEstDescQuery
{
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;
}

export default ApiOpenAiRealEstDescQueryDto;

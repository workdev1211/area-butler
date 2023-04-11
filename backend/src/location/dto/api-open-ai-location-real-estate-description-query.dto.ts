import { IsNotEmpty, IsString } from 'class-validator';

import ApiOpenAiLocationDescriptionQueryDto from './api-open-ai-location-description-query.dto';
import { IApiOpenAiLocationRealEstateDescriptionQuery } from '@area-butler-types/open-ai';

class ApiOpenAiLocationRealEstateDescriptionQueryDto
  extends ApiOpenAiLocationDescriptionQueryDto
  implements IApiOpenAiLocationRealEstateDescriptionQuery
{
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;
}

export default ApiOpenAiLocationRealEstateDescriptionQueryDto;

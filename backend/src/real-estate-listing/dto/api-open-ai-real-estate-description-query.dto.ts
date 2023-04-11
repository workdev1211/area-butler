import { IsNotEmpty, IsString } from 'class-validator';

import { IApiOpenAiRealEstateDescriptionQuery } from '@area-butler-types/open-ai';

class ApiOpenAiRealEstateDescriptionQueryDto
  implements IApiOpenAiRealEstateDescriptionQuery
{
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;
}

export default ApiOpenAiRealEstateDescriptionQueryDto;

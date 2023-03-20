import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IApiOpenAiRealEstateDescriptionQuery } from '@area-butler-types/open-ai';

class ApiOpenAiRealEstateDescriptionQueryDto
  implements IApiOpenAiRealEstateDescriptionQuery
{
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;

  @IsOptional()
  @IsString()
  integrationId?: string;
}

export default ApiOpenAiRealEstateDescriptionQueryDto;

import { IsNotEmpty, IsString } from 'class-validator';

import { IOpenAiRealEstateDescriptionFormValues } from '@area-butler-types/open-ai';

class ApiOpenAiRealEstateDescriptionQueryDto
  implements IOpenAiRealEstateDescriptionFormValues
{
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;
}

export default ApiOpenAiRealEstateDescriptionQueryDto;

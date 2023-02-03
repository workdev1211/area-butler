import { IsNotEmpty, IsString } from 'class-validator';

import ApiOpenAiLocationDescriptionQueryDto from './api-open-ai-location-description-query.dto';

class ApiOpenAiLocationRealEstateDescriptionQueryDto extends ApiOpenAiLocationDescriptionQueryDto {
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;
}

export default ApiOpenAiLocationRealEstateDescriptionQueryDto;

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import ApiOpenAiLocationDescriptionQueryDto from './api-open-ai-location-description-query.dto';

class ApiOpenAiLocationRealEstateDescriptionQueryDto extends ApiOpenAiLocationDescriptionQueryDto {
  @IsNotEmpty()
  @IsString()
  realEstateListingId: string;

  @IsOptional()
  @IsString()
  integrationId?: string;
}

export default ApiOpenAiLocationRealEstateDescriptionQueryDto;

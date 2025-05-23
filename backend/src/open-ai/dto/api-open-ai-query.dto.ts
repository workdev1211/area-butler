import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IApiOpenAiQuery } from '@area-butler-types/open-ai';

class ApiOpenAiQueryDto implements IApiOpenAiQuery {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsBoolean()
  isFormalToInformal?: boolean;

  // in case of the integration
  @IsOptional()
  @IsString()
  realEstateListingId?: string;
}

export default ApiOpenAiQueryDto;

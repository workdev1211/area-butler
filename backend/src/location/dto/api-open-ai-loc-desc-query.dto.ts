import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { MeansOfTransportation } from '@area-butler-types/types';
import { IApiOpenAiLocDescQuery } from '@area-butler-types/open-ai';
import ApiOpenAiGeneralQueryDto from './api-open-ai-general-query.dto';

class ApiOpenAiLocDescQueryDto
  extends ApiOpenAiGeneralQueryDto
  implements IApiOpenAiLocDescQuery
{
  @IsNotEmpty()
  @IsString()
  searchResultSnapshotId: string;

  @IsNotEmpty()
  @IsEnum(MeansOfTransportation)
  meanOfTransportation: MeansOfTransportation;

  // in case of the integration
  @IsOptional()
  @IsString()
  realEstateListingId?: string;
}

export default ApiOpenAiLocDescQueryDto;

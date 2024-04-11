import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  IsISO8601,
  IsBoolean,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiRealEstateIntegrationParams } from '@area-butler-types/integration';
import ApiIntegrationParamsDto from './api-integration-params.dto';

@Exclude()
class ApiRealEstateIntegrationParamsDto
  extends ApiIntegrationParamsDto
  implements IApiRealEstateIntegrationParams
{
  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @IsPositive()
  openAiRequestQuantity?: number;

  @Expose()
  @IsOptional()
  @IsISO8601()
  iframeEndsAt?: Date;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isOnePageExportActive?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isStatsFullExportActive?: boolean;
}

export default ApiRealEstateIntegrationParamsDto;

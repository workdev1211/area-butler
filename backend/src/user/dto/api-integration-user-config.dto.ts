import {
  IsBoolean,
  // IsNotEmpty,
  // IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { TApiIntegrationUserConfig } from '@area-butler-types/integration-user';

class ApiIntegrationUserConfigDto
  implements Partial<TApiIntegrationUserConfig>
{
  @IsOptional()
  @IsString()
  mapboxAccessToken?: string;

  @IsOptional()
  @IsBoolean()
  hideProductPage?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  mapIcon?: string;

  // @IsNotEmpty()
  // @IsObject()
  // showTour: ApiShowTour;

  // @IsOptional()
  // @IsObject()
  // exportMatching?: Record<TAreaButlerExportTypes, IIntUserExpMatchParams>;

  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default ApiIntegrationUserConfigDto;

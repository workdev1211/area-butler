import {
  IsBoolean,
  // IsNotEmpty,
  // IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IIntUserConfig } from '@area-butler-types/integration-user';

@Exclude()
class ApiIntegrationUserConfigDto implements Partial<IIntUserConfig> {
  @Expose()
  @IsOptional()
  @IsString()
  mapboxAccessToken?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  hideProductPage?: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  color?: string;

  @Expose()
  @IsOptional()
  @IsString()
  logo?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mapIcon?: string;

  // @Expose()
  // @IsNotEmpty()
  // @IsObject()
  // showTour: ApiShowTour;

  // @Expose()
  // @IsOptional()
  // @IsObject()
  // exportMatching?: Record<TAreaButlerExportTypes, IIntUserExpMatchParams>;

  @Expose()
  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default ApiIntegrationUserConfigDto;

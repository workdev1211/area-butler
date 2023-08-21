import { IsOptional, IsString } from 'class-validator';

import { ApiUserSettings } from '@area-butler-types/types';

class ApiUserSettingsDto implements ApiUserSettings {
  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  mapIcon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default ApiUserSettingsDto;

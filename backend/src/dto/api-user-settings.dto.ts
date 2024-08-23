import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { ApiUserSettings } from '@area-butler-types/types';

// TODO Update the dto after moving the settings to the 'Company' entity

@Exclude()
class ApiUserSettingsDto implements ApiUserSettings {
  @Expose()
  @IsOptional()
  @IsString()
  logo?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mapIcon?: string;

  @Expose()
  @IsOptional()
  @IsString()
  color?: string;

  @Expose()
  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default ApiUserSettingsDto;

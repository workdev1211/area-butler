import { IsOptional, IsString } from 'class-validator';

import { IApiUserParentSettings } from '@area-butler-types/types';

class ApiUserParentSettingsDto implements IApiUserParentSettings {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  mapIcon?: string;
}

export default ApiUserParentSettingsDto;

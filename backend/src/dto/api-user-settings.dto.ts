import { ApiUserSettings } from '@area-butler-types/types';
import { IsOptional } from 'class-validator';

class ApiUserSettingsDto implements ApiUserSettings {

  @IsOptional()
  logo?: string;

  @IsOptional()
  mapIcon?: string;
  
  @IsOptional()
  color?: string;
}

export default ApiUserSettingsDto;

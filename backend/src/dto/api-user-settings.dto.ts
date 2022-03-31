import { ApiUserSettings } from '@area-butler-types/types';

class ApiUserSettingsDto implements ApiUserSettings {
  logo?: string;
  mapIcon?: string;
  color?: string;
}

export default ApiUserSettingsDto;

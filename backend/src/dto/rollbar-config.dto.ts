import { RollbarConfig } from '@area-butler-types/types';

class RollbarConfigDto implements RollbarConfig {
  accessToken: string;
  code_version: string;
  environment: string;
}

export default RollbarConfigDto;

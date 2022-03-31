import { ApiConfig } from '@area-butler-types/types';
import RollbarConfigDto from './rollbar-config.dto';

export class ApiConfigDto implements ApiConfig {
  auth: { clientId: string; domain: string };
  googleApiKey: string;
  mapBoxAccessToken: string;
  rollbarConfig: RollbarConfigDto;
  stripeEnv: 'dev' | 'prod';
}

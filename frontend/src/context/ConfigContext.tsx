import { createContext } from 'react';
import { ApiConfig } from '../../../shared/types/types';

export const ConfigContext = createContext<ApiConfig>({
  auth: { clientId: '', domain: '' },
  googleApiKey: '',
  mapBoxAccessToken: '',
  stripeEnv: 'dev',
  inviteCodeNeeded: false,
  rollbarConfig: {
    accessToken: '',
    environment: 'undefined',
    code_version: 'undefined',
  },
});

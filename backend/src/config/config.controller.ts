import { ApiConfig } from '@area-butler-types/types';
import { Controller, Get } from '@nestjs/common';
import { configService } from './config.service';

@Controller('api/config')
export class ConfigController {
  @Get()
  public fetchConfig(): ApiConfig {
    const { domain, audience } = configService.getAuthConfig();
    const googleApiKey = configService.getGoogleApiKey();
    const mapBoxAccessToken = configService.getMapBoxAccessToken();
    const stripeEnv = configService.getStripeEnv();
    const inviteCodeNeeded = configService.IsInviteCodeNeeded();
    const rollbarConfig = configService.getRollbarConfig();
    return {
      auth: {
        domain,
        clientId: audience,
      },
      googleApiKey,
      mapBoxAccessToken,
      stripeEnv,
      inviteCodeNeeded,
      rollbarConfig,
    };
  }
}

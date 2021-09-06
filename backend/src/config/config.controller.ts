import { ApiConfig } from '@area-butler-types/types';
import { Controller, Get } from '@nestjs/common';
import { configService } from './config.service';

@Controller('api/config')
export class ConfigController {
  @Get()
  public fetchConfig(): ApiConfig {
    const { domain, audience } = configService.getAuthConfig();
    const googleApiKey = configService.getGoogleApiKey();
    return {
      auth: {
        domain,
        clientId: audience,
      },
      googleApiKey
    };
  }
}

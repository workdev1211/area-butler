import { Controller, Get } from '@nestjs/common';
import { configService } from './config.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiConfigDto } from '../dto/api-config.dto';

@ApiTags('config')
@Controller('api/config')
export class ConfigController {
  @ApiOperation({ description: 'Get the client configuration' })
  @Get()
  public fetchConfig(): ApiConfigDto {
    const { domain, audience } = configService.getAuthConfig();
    const googleApiKey = configService.getGoogleApiKey();
    const mapBoxAccessToken = configService.getMapBoxAccessToken();
    const stripeEnv = configService.getStripeEnv();
    const rollbarConfig = configService.getRollbarConfig();
    return {
      auth: {
        domain,
        clientId: audience,
      },
      googleApiKey,
      mapBoxAccessToken,
      stripeEnv,
      rollbarConfig,
    };
  }
}

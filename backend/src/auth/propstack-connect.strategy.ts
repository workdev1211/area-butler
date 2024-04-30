import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import { propstackConnectRoutePath } from '../../../shared/constants/propstack/propstack-constants';
import { configService } from '../config/config.service';

@Injectable()
export class PropstackConnectStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'propstack-connect',
) {
  private readonly logger = new Logger(PropstackConnectStrategy.name);
  private readonly propstackConnectApiKey =
    configService.getPropstackConnectApiKey();

  constructor() {
    super(
      {
        header: 'X-Api-Key',
      },
      true,
      async (apiKey: string, verified, req): Promise<void> => {
        const routePath = req.route.path;

        if (
          apiKey === this.propstackConnectApiKey &&
          routePath === propstackConnectRoutePath
        ) {
          return verified(null, {});
        }

        this.logger.debug(`\nRoute path: ${routePath}\nAPI key: ${apiKey}`);

        return verified(new UnauthorizedException());
      },
    );
  }
}

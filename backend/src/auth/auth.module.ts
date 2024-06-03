import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { Auth0ApiStrategy } from './auth0/auth0-api.strategy';
import { Auth0SpaStrategy } from './auth0/auth0-spa.strategy';
import { ApiKeyStrategy } from './api-key/api-key.strategy';
import { RolesGuard } from './role/roles.guard';
import { UserModule } from '../user/user.module';
import { PropstackConnectStrategy } from './propstack/propstack-connect.strategy';
import { PropstackWebhookIntStrategy } from './propstack/propstack-webhook-int.strategy';

@Module({
  imports: [PassportModule, UserModule],
  providers: [
    Auth0SpaStrategy,
    Auth0ApiStrategy,
    ApiKeyStrategy,
    RolesGuard,
    PropstackConnectStrategy,
    PropstackWebhookIntStrategy,
  ],
  exports: [
    Auth0SpaStrategy,
    Auth0ApiStrategy,
    ApiKeyStrategy,
    RolesGuard,
    PropstackConnectStrategy,
    PropstackWebhookIntStrategy,
  ],
})
export class AuthModule {}

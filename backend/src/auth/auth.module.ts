import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { Auth0ApiStrategy } from './auth0/auth0-api.strategy';
import { Auth0SpaStrategy } from './auth0/auth0-spa.strategy';
import { ApiKeyStrategy } from './api-key/api-key.strategy';
import { RolesGuard } from './role/roles.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PassportModule, UserModule],
  providers: [
    Auth0SpaStrategy,
    Auth0ApiStrategy,
    ApiKeyStrategy,
    RolesGuard,
  ],
  exports: [
    Auth0SpaStrategy,
    Auth0ApiStrategy,
    ApiKeyStrategy,
    RolesGuard,
  ],
})
export class AuthModule {}

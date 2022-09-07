import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { Auth0ApiStrategy } from './auth0-api.strategy';
import { Auth0SpaStrategy } from './auth0-spa.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PassportModule],
  providers: [Auth0SpaStrategy, Auth0ApiStrategy, RolesGuard],
  exports: [Auth0SpaStrategy, Auth0ApiStrategy, RolesGuard],
})
export class AuthModule {}
